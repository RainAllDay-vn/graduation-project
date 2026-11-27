# External Data Source Ingestion Contract

NOC supports one unified ingestion pipeline (`SourceIngestionService`) across two transports:
- **REST pull** (`RestSourceConnector` + `RestPollingScheduler`)
- **RabbitMQ push** (`MqConsumerRegistry`)

---

## 1. Transport Contracts

### REST Pull (`type: "REST"`)
- **Connection test (`POST /api/sources/{id}/test-connection`):** `GET <endpointUrl>` (expects `2xx`).
- **Scheduled / manual sync:** `GET <endpointUrl>?since=<ISO-8601>` (uses `&since=` if `endpointUrl` already contains `?`). `since` is omitted on the first sync (`lastSyncAt == null`).
- **Authentication (`authType`):**
  - `NONE` — no auth header
  - `API_KEY` — sends `X-API-Key: <authToken>`
  - `BEARER_TOKEN` — sends `Authorization: Bearer <authToken>`
- **Response body:**
  - Empty body → `SUCCESS` (`0` fetched, `0` failed)
  - Single JSON message object, or a JSON array of message objects
- **Batch ordering & partial-batch rule:**
  - Array batches are ordered by dependency tier before execution (`node.discovered` → `node.status` → `link.discovered` / `service.discovered` → `link.status` / `service.status` / `service.dependency` → `telemetry.*` / `alarm` → `link.removed` → `node.removed`).
  - If **any** message in a REST batch fails, the sync run is marked `FAILED`, the source moves to `ERROR` (manual `/resync` recovers it), and `RestPollingScheduler` skips `ERROR` sources.
- **Simulated mode (`app.sources.sync.simulated=true`):** Uses `SimulatedSourceConnector`, emitting 5 deterministic records (`1` snapshot + `3` latency points + `1` alarm) for `DEV-SIM-1..6`.

### RabbitMQ Push (`type: "MQ"`)
- **Exchange:** Durable `topic` exchange `noc.sources`
- **Queue & routing:** Queue `noc.source.<sourceId>` bound with routing key `source.topic` (defaults to `#` if blank)
- **Payload:** **One JSON message object per AMQP message** (JSON arrays are not unpacked by `MqConsumerRegistry`; publish dependent `node.discovered` messages before `link.discovered` / `service.discovered`).
- **Status tracking:** Updates `data_sources.last_sync_at`, `last_sync_status`, and `status` directly without creating `source_sync_history` rows.

---

## 2. Message Envelope

Every message uses the shared envelope:

```json
{
  "type": "<message-type>",
  "occurredAt": "2026-11-27T10:00:00Z",
  "payload": { }
}
```

- `type` *(required)*: One of the 12 supported types below.
- `occurredAt` *(optional)*: ISO-8601 timestamp or epoch milliseconds.
- `payload` *(required)*: JSON object specific to `type`.

---

## 3. Supported Message Types

### Telemetry & Alarms (PostgreSQL)

#### `telemetry.snapshot`
Inserts a `device_telemetry_snapshots` row.
- **Required:** `deviceId` (string), `operStatus` (`UP` | `DOWN` | `DEGRADED`)
- **Optional:** `collectedAt`, `uptimeSeconds`, `loadPercentage`, `routesLearned`, `routesUsed`, `cpuPercent`, `memoryPercent`, `temperatureCelsius`

#### `telemetry.points`
Inserts rows into `telemetry_timeseries`.
- **Required:** `deviceId` (string), `points` (non-empty array of `{ "value": number, "timestamp"?: ISO-8601|epochMs, "metricName"?: string, "unit"?: string }`)
- **Optional:** `metricName` (default if omitted on individual points), `unit`

#### `alarm`
Inserts an `alarms` row and attaches it to an existing non-closed `Incident` for `deviceId` (or creates an `OPEN` `INC-MQ-*` incident if none exists).
- **Required:** `deviceId` (string), `faultCode` (string)
- **Optional:** `severity` (`INFO` | `WARNING` | `ERROR` | `CRITICAL`, default `WARNING`), `timestamp`, `message`

---

### Topology Nodes (Neo4j `NetworkDevice`)

#### `node.discovered`
Upserts a `NetworkDevice` (creates if missing; updates non-null fields if present while preserving links).
- **Required:** `id` (string), `name` (string), `layer` (`PEER` | `IGW` | `CORE` | `AGGREGATION` | `EXCHANGE` | `ACCESS`)
- **Optional:** `region`, `site`, `ipAddress`, `model`, `status` (`ACTIVE` | `DEGRADED` | `CRITICAL` | `OFFLINE`, default `ACTIVE` on create), `accessDeviceCount`, `accessErrorCount`

#### `node.status`
Partial status / access-count update on an existing `NetworkDevice`.
- **Required:** `id` (or `deviceId`), `status` (`ACTIVE` | `DEGRADED` | `CRITICAL` | `OFFLINE`)
- **Optional:** `accessDeviceCount`, `accessErrorCount`

#### `node.removed`
Removes or offlines an existing `NetworkDevice`.
- **Required:** `id` (or `deviceId`)
- **Optional:** `hardDelete` (boolean, default `false` → sets `status = OFFLINE`; `true` → `DETACH DELETE`)

---

### Topology Links (Neo4j `CONNECTED_TO`)

#### `link.discovered`
Upserts a `CONNECTED_TO` edge identified by `linkId` (handles moving `linkId` to a new `sourceDeviceId`). Both endpoints must exist.
- **Required:** `linkId`, `sourceDeviceId`, `targetDeviceId`, `sourcePort`, `targetPort`
- **Optional:** `linkType` (`PHYSICAL_FIBER` | `LOGICAL_IP`, default `PHYSICAL_FIBER`), `capacityGbps` (default `100`), `operStatus` (default `"UP"`), `rxPowerDbm`, `txPowerDbm`, `utilizationPercent` (default `0.0`), `isBackup` (default `false`)

#### `link.status`
Partial state/metric update on an existing `linkId`.
- **Required:** `linkId`, plus at least one of: `operStatus`, `utilizationPercent`, `rxPowerDbm`, `txPowerDbm`

#### `link.removed`
Marks a link down or deletes the `CONNECTED_TO` edge.
- **Required:** `linkId`
- **Optional:** `hardDelete` (boolean, default `false` → sets `operStatus = "DOWN"`; `true` → deletes relationship)

---

### L3 Services (Neo4j `NetworkService` & `DEPENDS_ON`)

#### `service.discovered`
Upserts a `NetworkService` (preserves existing `DEPENDS_ON` edges if `dependentDeviceIds` is omitted).
- **Required:** `id`, `name`, `type` (`INTERNET_TRANSIT` | `VPN_MPLS` | `VOIP` | `IPTV` | `CLOUD_CONNECT` | `DATACENTER` | `DNS`)
- **Optional:** `description`, `region`, `status` (`OPERATIONAL` | `DEGRADED` | `OUTAGE`, default `OPERATIONAL`), `subscriberCount` (default `0`), `dependentDeviceIds` (string array)

#### `service.status`
Updates service lifecycle status.
- **Required:** `id` (or `serviceId`), `status` (`OPERATIONAL` | `DEGRADED` | `OUTAGE`)

#### `service.dependency`
Replaces all `DEPENDS_ON` edges for an existing `NetworkService` (pass `[]` to clear).
- **Required:** `id` (or `serviceId`), `dependentDeviceIds` (string array; every device ID must exist)

---

## 4. Local Dev Mock Sources

- **REST Mock (`mock-source`):** `http://localhost:8001/events` (`GET /health`, `X-API-Key: noc-mock-dev-key`), seeded in `dev` as `DS-MOCK-01` (`pollIntervalSeconds: 5`).
- **RabbitMQ Mock (`mock-mq-source`):** Publishes every 5s to `noc.sources` on routing key `mock.mq.events` (`CORE-02`, `EDGE-MQ-01`, `LINK-MOCK-MQ-CORE-02`, `SVC-MOCK-MQ-01`).

Quick REST probe:
```bash
curl -H "X-API-Key: noc-mock-dev-key" "http://localhost:8001/events"
```
