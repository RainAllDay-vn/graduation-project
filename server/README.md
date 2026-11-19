# RabbitMQ consumer (message-queue sources)

MQ-type data sources are consumed by a real RabbitMQ consumer (`MqConsumerRegistry`).
Each active MQ source gets one durable queue `noc.source.<sourceId>` bound to the topic
exchange `noc.sources` with routing key = the source's configured topic. The consumer is
always-on: the app boots without a broker (it retries in the background) and attaches
automatically when the broker appears (re-check every 30s, plus after every source
create/update/delete).

## 1. Start a broker (dev)

```bash
docker run -d --name noc-rabbit -p 5672:5672 -p 15672:15672 rabbitmq:3-alpine
```

Management UI: http://localhost:15672 (guest/guest). Connection settings match
`spring.rabbitmq.*` in `application.yml` (env-overridable: `RABBITMQ_HOST`, `RABBITMQ_PORT`,
`RABBITMQ_USERNAME`, `RABBITMQ_PASSWORD`).

## 2. Message contract

One JSON object per message, published to exchange `noc.sources` with the source's topic
as routing key:

```json
{
  "type": "telemetry.snapshot" | "telemetry.points" | "alarm",
  "occurredAt": "2026-11-17T10:00:00Z",
  "payload": { "...": "..." }
}
```

| type                 | payload fields                                                                                                  | ingested via                        |
| -------------------- | --------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| `telemetry.snapshot` | `deviceId`*, `operStatus`* (UP/DOWN/DEGRADED), `collectedAt`, `cpuPercent`, `memoryPercent`, `temperatureCelsius`, `uptimeSeconds`, `loadPercentage`, `routesLearned`, `routesUsed` | `TelemetryService.recordSnapshot`   |
| `telemetry.points`   | `deviceId`*, `metricName`*, `unit`, `points`: `[{timestamp, value}]` (per-point `metricName`/`unit` override allowed) | `TelemetryService.recordTimeseriesPoints` |
| `alarm`              | `deviceId`*, `faultCode`*, `severity` (default WARNING), `message`, `timestamp`                                  | attach to open incident, else create one |

Fields marked * are required. Invalid messages are logged and marked on the source row
(`lastSyncStatus = FAILED`) without stopping the stream; MQ sources have no poll history.

## 3. Publish a demo message

Dev seeds include two MQ sources: `netflow.events` (NetFlow Collector) and `syslog.raw`
(Syslog Gateway). Easiest from the management UI: Queues → `noc.source.DS-NETFLOW-01` →
Publish message (default exchange, routing key = queue name), or via HTTP API:

```bash
curl -u guest:guest -H "Content-Type: application/json" \
  -X POST http://localhost:15672/api/exchanges/%2F/noc.sources/publish \
  -d '{
    "properties": {"content_type": "application/json"},
    "routing_key": "netflow.events",
    "payload": "{\"type\":\"telemetry.snapshot\",\"payload\":{\"deviceId\":\"SW-HN-02\",\"operStatus\":\"DEGRADED\",\"cpuPercent\":91.5,\"temperatureCelsius\":71.0}}",
    "payload_encoding": "string"
  }'
```

Then check the source row on the Sources page (`lastSyncAt`/`lastSyncStatus`) and the
ingested data on the device page. For `alarm` messages, a new incident appears under
`INC-MQ-XXXXXXXX` when the device has no open incident.

## 4. Tests

- `MqMessageHandlerTest` — pure unit tests (no broker).
- `MqConsumerRegistryIntegrationTest` — real-broker e2e via Testcontainers
  (requires Docker; uses `rabbitmq:3-alpine`). Docker Engine ≥ 29 needs
  `-Dapi.version` handling already built into the Gradle `test` task.

---

# RAG knowledge indexing (pgvector)

Technical documents (SOPs, vendor specs) are chunked and embedded into the
`technical_doc_embeddings` pgvector table (1536-dim, cosine) so the AI investigation
can retrieve relevant runbook snippets (design `docs/week07-ai-design` §5).

- Indexing runs automatically: on document upload/replace (via the async indexing
  pipeline), on dev-profile boot for the 3 seeded SOPs, and on document delete the
  vectors are removed. Fail-soft: an unavailable embedding API or vector store only
  logs a warning and never breaks uploads or startup.
- Toggle: `app.rag.indexing-enabled` (default `true`); embedding model
  `spring.ai.openai.embedding.options.model` (default `text-embedding-3-small`,
  env `OPENAI_EMBEDDING_MODEL`).

## 1. Prerequisites (dev)

```bash
# PostgreSQL with the pgvector extension
docker run -d --name noc-postgres -p 5432:5432 -e POSTGRES_PASSWORD=postgres pgvector/pgvector:pg16

# Embedding API key
export OPENAI_API_KEY=sk-...
```

The vector table is created automatically (`initialize-schema: true`).

## 2. Smoke check

1. Start the server (`./gradlew bootRun`, dev profile) — boot logs show
   `Indexed ... chunks of document SOP-OPTICS-01/02, SOP-BGP-01 ...`.
2. Verify rows:

   ```bash
   docker exec -it noc-postgres psql -U postgres -d noc_db \
     -c "SELECT metadata->>'documentId' AS doc, count(*) FROM technical_doc_embeddings GROUP BY 1;"
   ```
3. Upload a new `.md` document via `POST /api/documents` — the row count for its id grows.
4. Delete the document (`DELETE /api/documents/{id}`) — its rows disappear.

Without `OPENAI_API_KEY` the boot indexing attempt fails with a warning and the app
continues (rule-based engine and everything else unaffected).
