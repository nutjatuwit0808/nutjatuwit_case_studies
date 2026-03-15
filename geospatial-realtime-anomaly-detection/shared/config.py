"""Shared Kafka config: brokers และ topic names สำหรับ Geo-Stream services."""
import os

KAFKA_BROKERS = os.getenv("KAFKA_BROKERS", "localhost:9092")
TOPIC_GPS = "vehicle-gps-stream"
TOPIC_ALERTS = "vehicle-alerts"
