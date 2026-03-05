import type { Map as MapboxMap } from "mapbox-gl";

/**
 * คอนฟิกสำหรับ Fleet MVT layer
 * รวม constants และ helpers ที่ใช้ร่วมกันระหว่าง FleetMap และ API
 */

/** ID ของ Mapbox source สำหรับ fleet vector tiles */
export const FLEET_SOURCE_ID = "realtime-fleet";
/** ID ของ Mapbox layer สำหรับจุด fleet */
export const FLEET_LAYER_ID = "fleet-points";
/** ชื่อ source-layer ใน MVT */
export const FLEET_SOURCE_LAYER = "fleet_layer";

/** ช่วงเวลารีเฟรช tiles (ms) เพื่อให้ตำแหน่งรถอัปเดตแบบ real-time */
export const FLEET_POLL_INTERVAL_MS = 5000;

/** สร้าง URL สำหรับ fleet MVT tiles พร้อม cache-bust query */
export function getFleetTilesUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  const ts = Date.now();
  return `${base}/api/tiles/fleet/{z}/{x}/{y}.pbf?t=${ts}`;
}

/** ID ของ icon สำหรับ fleet symbol layer */
export const FLEET_ICON_ID = "fleet-truck";

/** Layout สำหรับ fleet symbol layer (ใช้ SVG truck icon) */
export const FLEET_LAYER_LAYOUT = {
  "icon-image": FLEET_ICON_ID,
  "icon-size": 1,
  "icon-allow-overlap": true,
  "icon-ignore-placement": true,
  "icon-anchor": "bottom",
  "icon-rotate": ["coalesce", ["get", "bearing"], 0],
  "icon-rotation-alignment": "map",
} as const;

/** โหลด fleet truck SVG เป็น image แล้ว add ลง map (Mapbox ไม่รองรับ SVG โดยตรง ต้อง render ผ่าน canvas) */
export function loadFleetIcon(map: MapboxMap): Promise<void> {
  if (map.hasImage(FLEET_ICON_ID)) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const w = 40;
      const h = 60;
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas 2d context not available"));
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      const imageData = ctx.getImageData(0, 0, w, h);
      map.addImage(FLEET_ICON_ID, imageData, { pixelRatio: 2 });
      resolve();
    };
    img.onerror = () => reject(new Error("Failed to load fleet icon"));
    img.src = "/fleet-truck.svg";
  });
}
