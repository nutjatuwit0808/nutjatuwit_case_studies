"""Shared Kafka helpers: producer/consumer creation และ message parsing."""
import json
from confluent_kafka import Consumer, Producer


def create_producer(
    bootstrap_servers: str,
    acks: str = "all",
    retries: int = 3,
    **kwargs,
) -> Producer:
    """Create Kafka producer with common defaults."""
    config = {
        "bootstrap.servers": bootstrap_servers,
        "acks": acks,
        "retries": retries,
        **kwargs,
    }
    return Producer(config)


def create_consumer(
    bootstrap_servers: str,
    group_id: str,
    auto_offset_reset: str = "latest",
) -> Consumer:
    """Create Kafka consumer with common defaults."""
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
