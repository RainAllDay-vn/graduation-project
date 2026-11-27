import asyncio
import os
import random
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import FastAPI, Header, HTTPException, Query

API_KEY = os.environ.get("MOCK_API_KEY", "").strip()
DEVICE_ID = os.environ.get("MOCK_DEVICE_ID", "CORE-01")
EDGE_DEVICE_ID = os.environ.get("MOCK_EDGE_DEVICE_ID", "EDGE-MOCK-01")
LINK_ID = os.environ.get("MOCK_LINK_ID", "LINK-MOCK-EDGE-CORE-01")
SERVICE_ID = os.environ.get("MOCK_SERVICE_ID", "SVC-MOCK-01")
GENERATE_INTERVAL = float(os.environ.get("MOCK_GENERATE_INTERVAL_SECONDS", "10"))
ALARM_EVERY = int(os.environ.get("MOCK_ALARM_EVERY", "3"))
TOPOLOGY_EVERY = int(os.environ.get("MOCK_TOPOLOGY_EVERY", "3"))
MAX_EVENTS = 1000

_events: list[dict] = []
_generation = 0


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def iso(dt: datetime) -> str:
    return dt.isoformat().replace("+00:00", "Z")


def parse_iso(value: str) -> datetime:
    text = value.strip()
    if text.endswith("Z"):
        text = text[:-1] + "+00:00"
    parsed = datetime.fromisoformat(text)
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed


def make_batch(ts: datetime) -> list[dict]:
    global _generation
    _generation += 1
    is_alarm_cycle = ALARM_EVERY > 0 and _generation % ALARM_EVERY == 0
    is_topology_cycle = _generation == 1 or (TOPOLOGY_EVERY > 0 and _generation % TOPOLOGY_EVERY == 0)

    messages = []
    if is_topology_cycle:
        # Intentionally emit dependent messages before node.discovered to exercise batch ordering
        service_status = "DEGRADED" if is_alarm_cycle else "OPERATIONAL"
        messages.extend(
            [
                {
                    "type": "service.status",
                    "occurredAt": iso(ts),
                    "payload": {
                        "id": SERVICE_ID,
                        "status": service_status,
                    },
                },
                {
                    "type": "link.status",
                    "occurredAt": iso(ts),
                    "payload": {
                        "linkId": LINK_ID,
                        "operStatus": "DEGRADED" if is_alarm_cycle else "UP",
                        "utilizationPercent": round(random.uniform(25, 85), 1),
                        "rxPowerDbm": round(random.uniform(-16.0, -9.0), 1),
                    },
                },
                {
                    "type": "service.discovered",
                    "occurredAt": iso(ts),
                    "payload": {
                        "id": SERVICE_ID,
                        "name": "Mock Enterprise Transit",
                        "description": "Synced from mock-source",
                        "type": "INTERNET_TRANSIT",
                        "region": "Miền Bắc - Hà Nội",
                        "status": "OPERATIONAL",
                        "subscriberCount": 420,
                        "dependentDeviceIds": [DEVICE_ID, EDGE_DEVICE_ID],
                    },
                },
                {
                    "type": "link.discovered",
                    "occurredAt": iso(ts),
                    "payload": {
                        "linkId": LINK_ID,
                        "sourceDeviceId": EDGE_DEVICE_ID,
                        "targetDeviceId": DEVICE_ID,
                        "sourcePort": "et-0/0/1",
                        "targetPort": "et-0/0/48",
                        "linkType": "PHYSICAL_FIBER",
                        "capacityGbps": 100,
                        "operStatus": "UP",
                        "utilizationPercent": round(random.uniform(20, 60), 1),
                    },
                },
                {
                    "type": "node.discovered",
                    "occurredAt": iso(ts),
                    "payload": {
                        "id": EDGE_DEVICE_ID,
                        "name": "Mock Edge Router 01",
                        "layer": "AGGREGATION",
                        "region": "Miền Bắc - Hà Nội",
                        "site": "POP-HN-01",
                        "ipAddress": "10.100.99.1",
                        "model": "Nokia 7750 SR",
                        "status": "ACTIVE",
                    },
                },
            ]
        )

    messages.extend(
        [
            {
                "type": "telemetry.snapshot",
                "occurredAt": iso(ts),
                "payload": {
                    "deviceId": DEVICE_ID,
                    "operStatus": "UP",
                    "uptimeSeconds": 3600 * (1 + _generation),
                    "loadPercentage": round(random.uniform(20, 70), 1),
                    "routesLearned": 20,
                    "routesUsed": 18,
                    "cpuPercent": round(random.uniform(15, 80), 1),
                    "memoryPercent": round(random.uniform(30, 75), 1),
                    "temperatureCelsius": round(random.uniform(38, 65), 1),
                },
            },
            {
                "type": "telemetry.points",
                "occurredAt": iso(ts),
                "payload": {
                    "deviceId": DEVICE_ID,
                    "metricName": "latency_ms",
                    "unit": "ms",
                    "points": [
                        {"timestamp": iso(ts - timedelta(seconds=20)), "value": round(random.uniform(5, 30), 1)},
                        {"timestamp": iso(ts - timedelta(seconds=40)), "value": round(random.uniform(5, 30), 1)},
                        {"timestamp": iso(ts - timedelta(seconds=60)), "value": round(random.uniform(5, 30), 1)},
                    ],
                },
            },
        ]
    )
    if is_alarm_cycle:
        messages.append(
            {
                "type": "alarm",
                "occurredAt": iso(ts),
                "payload": {
                    "deviceId": DEVICE_ID,
                    "faultCode": "MOCK_LINK_FLAP",
                    "severity": "WARNING",
                    "timestamp": iso(ts),
                    "message": "Mock alarm from mock-source",
                },
            }
        )
    return messages


async def generator_loop() -> None:
    while True:
        await asyncio.sleep(max(GENERATE_INTERVAL, 1.0))
        _events.extend(make_batch(utc_now()))
        del _events[:-MAX_EVENTS]


@asynccontextmanager
async def lifespan(_: FastAPI):
    _events.extend(make_batch(utc_now()))
    task = asyncio.create_task(generator_loop())
    yield
    task.cancel()


app = FastAPI(title="NOC mock source", lifespan=lifespan)


def require_api_key(x_api_key: Optional[str]) -> None:
    if API_KEY and x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid or missing X-API-Key")


@app.get("/health")
async def health(x_api_key: Optional[str] = Header(default=None)) -> dict:
    require_api_key(x_api_key)
    return {"status": "ok", "events": len(_events)}


@app.get("/events")
async def get_events(
    since: Optional[str] = Query(default=None),
    x_api_key: Optional[str] = Header(default=None),
) -> list[dict]:
    require_api_key(x_api_key)
    if since is None or not since.strip():
        return list(_events)
    try:
        since_dt = parse_iso(since)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid since parameter: {since}")
    return [message for message in _events if parse_iso(message["occurredAt"]) > since_dt]
