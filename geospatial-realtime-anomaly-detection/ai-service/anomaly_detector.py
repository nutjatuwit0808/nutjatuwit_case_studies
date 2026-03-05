"""
Anomaly detector: Sliding window + Isolation Forest + rule-based (speed, idling).
"""
import math
from collections import deque
from dataclasses import dataclass
import numpy as np
from sklearn.ensemble import IsolationForest


def haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    R = 6371  # Earth radius km
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng / 2) ** 2
    )
    c = 2 * math.asin(math.sqrt(a))
    return R * c


@dataclass
class GpsPoint:
    lat: float
    lng: float
    speed: float
    timestamp: int


class AnomalyDetector:
    def __init__(
        self,
        window_size: int = 10,
        spatial_jump_km: float = 5.0,
        speed_limit_kmh: float = 120.0,
        idling_minutes: float = 30.0,
    ):
        self.window_size = window_size
        self.spatial_jump_km = spatial_jump_km
        self.speed_limit_kmh = speed_limit_kmh
        self.idling_minutes = idling_minutes
        self._windows: dict[str, deque[GpsPoint]] = {}
        self._fitted: dict[str, IsolationForest] = {}

    def _get_window(self, vehicle_id: str) -> deque[GpsPoint]:
        if vehicle_id not in self._windows:
            self._windows[vehicle_id] = deque(maxlen=self.window_size)
        return self._windows[vehicle_id]

    def add_point(self, vehicle_id: str, lat: float, lng: float, speed: float, timestamp: int):
        window = self._get_window(vehicle_id)
        window.append(GpsPoint(lat=lat, lng=lng, speed=speed, timestamp=timestamp))

    def check_anomalies(
        self, vehicle_id: str, lat: float, lng: float, speed: float, timestamp: int
    ) -> list[str]:
        """Returns list of anomaly type strings if any."""
        self.add_point(vehicle_id, lat, lng, speed, timestamp)
        window = self._get_window(vehicle_id)
        alerts = []

        # Spatial: jump across districts in 1 sec
        if len(window) >= 2:
            prev = window[-2]
            dist_km = haversine_km(prev.lat, prev.lng, lat, lng)
            if dist_km > self.spatial_jump_km:
                alerts.append(f"spatial: jumped {dist_km:.1f} km in 1 sec")

        # Speed
        if speed > self.speed_limit_kmh:
            alerts.append(f"speed: {speed:.0f} km/h exceeds {self.speed_limit_kmh} km/h")

        # Idling: same position for > idling_minutes
        if len(window) >= 2:
            first_ts = window[0].timestamp
            last_ts = window[-1].timestamp
            duration_min = (last_ts - first_ts) / 60.0
            if duration_min >= self.idling_minutes:
                # Check if position barely moved
                total_dist = 0.0
                for i in range(1, len(window)):
                    p1, p2 = window[i - 1], window[i]
                    total_dist += haversine_km(p1.lat, p1.lng, p2.lat, p2.lng)
                if total_dist < 0.1:  # < 100m total movement
                    alerts.append(f"idling: stationary {duration_min:.0f} min")

        # Isolation Forest on window features (lat, lng, speed)
        if len(window) >= self.window_size:
            X = np.array(
                [[p.lat, p.lng, p.speed] for p in window],
                dtype=np.float64,
            )
            if vehicle_id not in self._fitted:
                self._fitted[vehicle_id] = IsolationForest(
                    contamination=0.1, random_state=42, n_estimators=50
                )
                self._fitted[vehicle_id].fit(X)
            model = self._fitted[vehicle_id]
            pred = model.predict(X[-1:])
            if pred[0] == -1:
                alerts.append("ml: isolation forest outlier")

        return alerts
