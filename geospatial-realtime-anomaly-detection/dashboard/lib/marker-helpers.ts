import type { Marker } from "mapbox-gl";
import { MARKER_COLOR } from "./constants";

const MARKER_BASE_CLASS =
  "vehicle-marker transition-transform duration-500 ease-out";
const MARKER_INNER_CLASS =
  "w-4 h-4 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2";

/**
 * สร้าง DOM element สำหรับ vehicle marker บนแผนที่
 */
export function createVehicleMarkerElement(
  isAlerted: boolean,
  tooltipText?: string,
  vehicleId?: string
): HTMLDivElement {
  const el = document.createElement("div");
  el.className = MARKER_BASE_CLASS;
  el.innerHTML = `
    <div class="${MARKER_INNER_CLASS}"
         style="background: ${isAlerted ? MARKER_COLOR.alerted : MARKER_COLOR.normal}">
    </div>
  `;
  if (isAlerted) el.classList.add("animate-pulse");
  if (vehicleId) el.setAttribute("data-vehicle-id", vehicleId);
  if (isAlerted && tooltipText) {
    el.setAttribute("data-tooltip", tooltipText);
    el.style.cursor = "pointer";
  }
  return el;
}

/**
 * อัปเดตสีและ animation ของ marker ตามสถานะ alerted
 */
export function updateMarkerStyle(
  marker: Marker,
  isAlerted: boolean,
  tooltipText?: string
): void {
  const el = marker.getElement();
  const dot = el?.querySelector("div");
  if (!dot) return;

  (dot as HTMLElement).style.background = isAlerted
    ? MARKER_COLOR.alerted
    : MARKER_COLOR.normal;
  isAlerted ? el?.classList.add("animate-pulse") : el?.classList.remove("animate-pulse");
  if (el) {
    if (isAlerted && tooltipText) {
      el.setAttribute("data-tooltip", tooltipText);
      el.style.cursor = "pointer";
    } else {
      el.removeAttribute("data-tooltip");
      el.style.cursor = "";
    }
  }
}
