import json
import os
import random
import signal
import threading
from datetime import datetime, timedelta, timezone

import pika
from pika.exceptions import AMQPError

MQ_HOST = os.environ.get("MQ_HOST", "localhost")
MQ_PORT = int(os.environ.get("MQ_PORT", "5672"))
MQ_USER = os.environ.get("MQ_USER", "guest")
MQ_PASS = os.environ.get("MQ_PASS", "guest")
MQ_EXCHANGE = os.environ.get("MQ_EXCHANGE", "noc.sources")
MQ_ROUTING_KEY = os.environ.get("MQ_ROUTING_KEY", "mock.mq.events")
PUBLISH_INTERVAL = max(float(os.environ.get("MQ_PUBLISH_INTERVAL_SECONDS", "5")), 1.0)

DEVICE_ID = os.environ.get("MQ_DEVICE_ID", "CORE-02")
EDGE_DEVICE_ID = os.environ.get("MQ_EDGE_DEVICE_ID", "EDGE-MQ-01")
LINK_ID = os.environ.get("MQ_LINK_ID", "LINK-MOCK-MQ-CORE-02")
SERVICE_ID = os.environ.get("MQ_SERVICE_ID", "SVC-MOCK-MQ-01")
ALARM_EVERY = int(os.environ.get("MQ_ALARM_EVERY", "3"))
TOPOLOGY_EVERY = int(os.environ.get("MQ_TOPOLOGY_EVERY", "3"))

_stop_event = threading.Event()
_generation = 0


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def iso(dt: datetime) -> str:
    return dt.isoformat().replace("+00:00", "Z")


def make_messages(ts: datetime) -> list[dict]:
    """Build single-envelope messages in dependency order for sequential MQ ingestion."""
    global _generation
    _generation += 1
    is_alarm_cycle = ALARM_EVERY > 0 and _generation % ALARM_EVERY == 0
    is_topology_cycle = _generation == 1 or (TOPOLOGY_EVERY > 0 and _generation % TOPOLOGY_EVERY == 0)

    messages: list[dict] = []
    if is_topology_cycle:
        service_status = "DEGRADED" if is_alarm_cycle else "OPERATIONAL"
        link_oper_status = "DEGRADED" if is_alarm_cycle else "UP"
        messages.extend(
            [
                {
                    "type": "node.discovered",
                    "occurredAt": iso(ts),
                    "payload": {
                        "id": EDGE_DEVICE_ID,
                        "name": "Mock MQ Edge Router 01",
                        "layer": "AGGREGATION",
                        "region": "Miền Bắc - Hà Nội",
                        "site": "POP-HN-02",
                        "ipAddress": "10.100.99.2",
                        "model": "Cisco ASR 9006",
                        "status": "ACTIVE",
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
                    "type": "service.discovered",
                    "occurredAt": iso(ts),
                    "payload": {
                        "id": SERVICE_ID,
                        "name": "Mock MQ Enterprise VPN",
                        "description": "Synced via RabbitMQ push mock source",
                        "type": "VPN_MPLS",
                        "region": "Miền Bắc - Hà Nội",
                        "status": "OPERATIONAL",
                        "subscriberCount": 310,
                        "dependentDeviceIds": [DEVICE_ID, EDGE_DEVICE_ID],
                    },
                },
                {
                    "type": "link.status",
                    "occurredAt": iso(ts),
                    "payload": {
                        "linkId": LINK_ID,
                        "operStatus": link_oper_status,
                        "utilizationPercent": round(random.uniform(25, 85), 1),
                        "rxPowerDbm": round(random.uniform(-16.0, -9.0), 1),
                    },
                },
                {
                    "type": "service.status",
                    "occurredAt": iso(ts),
                    "payload": {
                        "id": SERVICE_ID,
                        "status": service_status,
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
                    "routesLearned": 24,
                    "routesUsed": 21,
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
                    "faultCode": "MOCK_MQ_OPTICAL_WARN",
                    "severity": "WARNING",
                    "timestamp": iso(ts),
                    "message": "Mock alarm from mock-mq-source",
                },
            }
        )

    return messages


def open_channel() -> tuple[pika.BlockingConnection, pika.adapters.blocking_connection.BlockingChannel]:
    credentials = pika.PlainCredentials(MQ_USER, MQ_PASS)
    params = pika.ConnectionParameters(
        host=MQ_HOST,
        port=MQ_PORT,
        credentials=credentials,
        heartbeat=30,
        blocked_connection_timeout=30,
    )
    connection = pika.BlockingConnection(params)
    channel = connection.channel()
    channel.exchange_declare(exchange=MQ_EXCHANGE, exchange_type="topic", durable=True)
    return connection, channel


def handle_signal(signum: int, _frame) -> None:
    print(f"Received signal {signum}, shutting down mock-mq-source...")
    _stop_event.set()


def main() -> None:
    signal.signal(signal.SIGINT, handle_signal)
    signal.signal(signal.SIGTERM, handle_signal)

    connection = None
    channel = None
    properties = pika.BasicProperties(content_type="application/json", delivery_mode=2)

    print(
        f"Starting mock-mq-source -> amqp://{MQ_HOST}:{MQ_PORT} "
        f"exchange={MQ_EXCHANGE} routing_key={MQ_ROUTING_KEY} interval={PUBLISH_INTERVAL}s"
    )

    while not _stop_event.is_set():
        try:
            if connection is None or connection.is_closed or channel is None or channel.is_closed:
                connection, channel = open_channel()
                print(f"Connected to RabbitMQ at {MQ_HOST}:{MQ_PORT}")

            batch = make_messages(utc_now())
            for msg in batch:
                channel.basic_publish(
                    exchange=MQ_EXCHANGE,
                    routing_key=MQ_ROUTING_KEY,
                    body=json.dumps(msg),
                    properties=properties,
                )
            print(f"Published generation={_generation} count={len(batch)} types={[m['type'] for m in batch]}")
            _stop_event.wait(PUBLISH_INTERVAL)
        except (AMQPError, OSError) as exc:
            print(f"RabbitMQ connection/publish error: {exc}; retrying in 3s...")
            if connection is not None and not connection.is_closed:
                try:
                    connection.close()
                except Exception:
                    pass
            connection = None
            channel = None
            _stop_event.wait(3.0)

    if connection is not None and not connection.is_closed:
        try:
            connection.close()
        except Exception:
            pass
    print("mock-mq-source stopped.")


if __name__ == "__main__":
    main()
