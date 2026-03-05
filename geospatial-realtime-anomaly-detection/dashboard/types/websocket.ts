/** GPS update payload from WebSocket gps:update event */
export interface GpsUpdate {
  vehicle_id: string;
  lat: number;
  lng: number;
  speed: number;
  timestamp: number;
}

/** Alert payload from WebSocket alert:new event */
export interface AlertPayload {
  vehicle_id: string;
  lat: number;
  lng: number;
  speed: number;
  timestamp: number;
  anomaly_types: string[];
}
