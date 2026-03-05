/** Default WebSocket URL when NEXT_PUBLIC_WS_URL is not set */
export const DEFAULT_WS_URL = "http://localhost:3001";

/** Max number of alerts to retain in the sidebar */
export const ALERT_RETENTION_COUNT = 20;

/** Duration (ms) to highlight a vehicle marker after an alert */
export const ALERT_HIGHLIGHT_MS = 10_000;

/** Marker colors for vehicle state */
export const MARKER_COLOR = {
  normal: "#22c55e",
  alerted: "#ef4444",
} as const;
