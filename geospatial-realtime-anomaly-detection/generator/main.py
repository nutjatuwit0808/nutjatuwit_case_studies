#!/usr/bin/env python3
"""
Generator: Mock GPS producer for Geo-Stream.
Sends vehicle GPS pings to Kafka topic vehicle-gps-stream with partition key = vehicle_id.
"""
import json
import random
import time

from confluent_kafka import Producer

from config import (
    KAFKA_BROKERS,
    TOPIC_GPS,
    VEHICLE_COUNT,
    INTERVAL_SEC,
    LAT_MIN,
    LAT_MAX,
    LNG_MIN,
    LNG_MAX,
    SPATIAL_DELTA,
    SPEED_DELTA,
    SPEED_ANOMALY_CHANCE,
    SPEED_ANOMALY_MIN,
    SPEED_ANOMALY_MAX,
)


def create_producer():
    return Producer({
        "bootstrap.servers": KAFKA_BROKERS,
        "acks": "all",
        "retries": 3,
    })


def generate_gps_ping(vehicle_id: str, lat: float, lng: float, speed: float) -> dict:
    return {
        "vehicle_id": vehicle_id,
        "lat": round(lat, 6),
        "lng": round(lng, 6),
        "speed": round(speed, 1),
        "timestamp": int(time.time()),
    }


def simulate_movement(
    vehicle_id: str, last_lat: float, last_lng: float, last_speed: float
) -> tuple[float, float, float]:
    """Simulate slight movement: small random delta, speed 0-80 km/h. Occasional speed anomaly for demo."""
    lat_delta = random.uniform(-SPATIAL_DELTA, SPATIAL_DELTA)
    lng_delta = random.uniform(-SPATIAL_DELTA, SPATIAL_DELTA)
    speed_delta = random.uniform(-SPEED_DELTA, SPEED_DELTA)
    new_lat = max(LAT_MIN, min(LAT_MAX, last_lat + lat_delta))
    new_lng = max(LNG_MIN, min(LNG_MAX, last_lng + lng_delta))
    new_speed = max(0, min(80, last_speed + speed_delta))
    if random.random() < SPEED_ANOMALY_CHANCE:
        new_speed = random.uniform(SPEED_ANOMALY_MIN, SPEED_ANOMALY_MAX)
    return new_lat, new_lng, new_speed


def main():
    print(f"Generator starting: {VEHICLE_COUNT} vehicles, interval {INTERVAL_SEC}s")
    print(f"Kafka brokers: {KAFKA_BROKERS}")

    producer = create_producer()
    vehicle_states = {}
    for i in range(1, VEHICLE_COUNT + 1):
        vid = f"TRK-{i:03d}"
        vehicle_states[vid] = {
            "lat": random.uniform(LAT_MIN, LAT_MAX),
            "lng": random.uniform(LNG_MIN, LNG_MAX),
            "speed": random.uniform(10, 50),
        }

    try:
        while True:
            for vehicle_id, state in vehicle_states.items():
                lat, lng, speed = simulate_movement(
                    vehicle_id, state["lat"], state["lng"], state["speed"]
                )
                state["lat"], state["lng"], state["speed"] = lat, lng, speed
                ping = generate_gps_ping(vehicle_id, lat, lng, speed)
                producer.produce(
                    TOPIC_GPS,
                    value=json.dumps(ping).encode("utf-8"),
                    key=vehicle_id.encode("utf-8") if vehicle_id else None,
                )
            producer.flush()
            print(f"Sent {VEHICLE_COUNT} pings at t={int(time.time())}")
            time.sleep(INTERVAL_SEC)
    except Exception as e:
        print(f"Kafka error: {e}")
    except KeyboardInterrupt:
        print("Stopping generator...")
    finally:
        producer.close()


if __name__ == "__main__":
    main()
