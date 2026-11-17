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
