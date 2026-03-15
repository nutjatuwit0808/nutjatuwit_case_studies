import sys
from pathlib import Path

# เพิ่ม project root เพื่อ import shared
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from shared.config import KAFKA_BROKERS, TOPIC_GPS, TOPIC_ALERTS

# Sliding window
WINDOW_SIZE = 10

# Anomaly thresholds
SPATIAL_JUMP_KM = 5.0  # km - jump across districts in 1 sec
SPEED_LIMIT_KMH = 120.0
IDLING_MINUTES = 30
