"""Generator configuration: Kafka, topic, vehicle count, and Bangkok area bounds."""
import sys
from pathlib import Path

# เพิ่ม project root เพื่อ import shared
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from shared.config import KAFKA_BROKERS, TOPIC_GPS

# Simulation
VEHICLE_COUNT = int(os.getenv("VEHICLE_COUNT", "20"))
INTERVAL_SEC = float(os.getenv("INTERVAL_SEC", "3.0"))

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
