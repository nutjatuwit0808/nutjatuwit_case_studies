import type { AlertPayload } from "@/types/websocket";

/**
 * สร้าง Map จาก alertedIds และ alerts สำหรับแสดง tooltip/popup ของรถที่ถูกแจ้งเตือน
 */
export function buildAlertedAlertsMap(
  alertedIds: Set<string>,
  alerts: AlertPayload[]
): Map<string, AlertPayload> {
  const map = new Map<string, AlertPayload>();
  for (const id of alertedIds) {
    const alert = alerts.find((a) => a.vehicle_id === id);
    if (alert) map.set(id, alert);
  }
  return map;
}
