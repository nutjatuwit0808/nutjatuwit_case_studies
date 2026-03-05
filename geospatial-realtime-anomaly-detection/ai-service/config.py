import os

KAFKA_BROKERS = os.getenv("KAFKA_BROKERS", "localhost:9092")
TOPIC_GPS = "vehicle-gps-stream"
TOPIC_ALERTS = "vehicle-alerts"

# Sliding window
WINDOW_SIZE = 10

# Anomaly thresholds
SPATIAL_JUMP_KM = 5.0  # km - jump across districts in 1 sec
SPEED_LIMIT_KMH = 120.0
IDLING_MINUTES = 30
