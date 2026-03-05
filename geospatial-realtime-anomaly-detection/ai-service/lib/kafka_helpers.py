"""Shared Kafka helpers: producer/consumer creation and message parsing."""
import json
from confluent_kafka import Consumer, Producer


def create_producer(bootstrap_servers: str, **kwargs) -> Producer:
    """Create a Kafka producer with common defaults."""
    config = {"bootstrap.servers": bootstrap_servers, **kwargs}
    return Producer(config)


def create_consumer(
    bootstrap_servers: str,
    group_id: str,
    auto_offset_reset: str = "latest",
) -> Consumer:
    """Create a Kafka consumer with common defaults."""
    return Consumer({
        "bootstrap.servers": bootstrap_servers,
        "group.id": group_id,
        "auto.offset.reset": auto_offset_reset,
    })


def parse_json_message(value: bytes | None) -> dict | None:
    """Parse Kafka message value as JSON. Returns None if invalid."""
    if not value:
        return None
    try:
        return json.loads(value.decode("utf-8"))
    except (json.JSONDecodeError, UnicodeDecodeError):
        return None
