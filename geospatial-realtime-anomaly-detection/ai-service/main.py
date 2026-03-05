#!/usr/bin/env python3
"""
AI Service: Consume vehicle-gps-stream, detect anomalies, produce to vehicle-alerts.
"""
import json
import time

from config import KAFKA_BROKERS, TOPIC_GPS, TOPIC_ALERTS, WINDOW_SIZE
from config import SPATIAL_JUMP_KM, SPEED_LIMIT_KMH, IDLING_MINUTES
from anomaly_detector import AnomalyDetector
from lib.kafka_helpers import create_consumer, create_producer, parse_json_message


def _build_alert_payload(
    vehicle_id: str,
    lat: float,
    lng: float,
    speed: float,
    timestamp: int,
    anomaly_types: list[str],
) -> dict:
    """Build alert payload for vehicle-alerts topic."""
    return {
        "vehicle_id": vehicle_id,
        "lat": lat,
        "lng": lng,
        "speed": speed,
        "timestamp": timestamp,
        "anomaly_types": anomaly_types,
    }


def main():
    print("AI Service starting...")
    print(f"Kafka brokers: {KAFKA_BROKERS}")

    detector = AnomalyDetector(
        window_size=WINDOW_SIZE,
        spatial_jump_km=SPATIAL_JUMP_KM,
        speed_limit_kmh=SPEED_LIMIT_KMH,
        idling_minutes=IDLING_MINUTES,
    )

    consumer = create_consumer(KAFKA_BROKERS, group_id="ai-anomaly-detector")
    consumer.subscribe([TOPIC_GPS])
    producer = create_producer(KAFKA_BROKERS)

    try:
        while True:
            msg = consumer.poll(1.0)
            if msg is None:
                continue
            if msg.error():
                print(f"Consumer error: {msg.error()}")
                continue
            try:
                data = parse_json_message(msg.value())
                if not data:
                    continue

                vehicle_id = data.get("vehicle_id")
                lat = data.get("lat")
                lng = data.get("lng")
                speed = data.get("speed", 0)
                timestamp = data.get("timestamp", int(time.time()))

                if not vehicle_id or lat is None or lng is None:
                    continue

                alerts = detector.check_anomalies(vehicle_id, lat, lng, speed, timestamp)

                if alerts:
                    alert_payload = _build_alert_payload(
                        vehicle_id, lat, lng, speed, timestamp, alerts
                    )
                    producer.produce(
                        TOPIC_ALERTS,
                        value=json.dumps(alert_payload).encode("utf-8"),
                    )
                    producer.flush()
                    print(f"Alert: {vehicle_id} - {alerts}")
            except Exception as e:
                print(f"Error processing message: {e}")
    except KeyboardInterrupt:
        print("Stopping AI service...")
    finally:
        consumer.close()
        producer.close()


if __name__ == "__main__":
    main()
