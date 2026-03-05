"""Generator configuration: Kafka, topic, vehicle count, and Bangkok area bounds."""
import os

# Kafka
KAFKA_BROKERS = os.getenv("KAFKA_BROKERS", "localhost:9092")
TOPIC_GPS = "vehicle-gps-stream"

# Simulation
VEHICLE_COUNT = int(os.getenv("VEHICLE_COUNT", "100"))
INTERVAL_SEC = float(os.getenv("INTERVAL_SEC", "1.0"))

# Bangkok area bounds for mock coordinates
LAT_MIN = 13.65
LAT_MAX = 13.85
LNG_MIN = 100.45
LNG_MAX = 100.65

# Movement simulation
SPATIAL_DELTA = 0.002  # max lat/lng change per tick
SPEED_DELTA = 5.0
SPEED_ANOMALY_CHANCE = 0.01  # 1% chance to inject demo speed anomaly
SPEED_ANOMALY_MIN = 125
SPEED_ANOMALY_MAX = 150
