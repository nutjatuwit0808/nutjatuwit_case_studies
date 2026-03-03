/**
 * Helper สำหรับคำนวณ diff, winner และข้อความแสดงผลใน PerformanceMetrics
 */

export type MetricWinner = "geojson" | "pmtiles" | "draw";

export interface MetricDiffResult {
  diff: number;
  diffPercent: string;
  winner: MetricWinner;
  diffText: string;
}

/**
 * คำนวณผลต่างระหว่าง pmtiles และ geojson พร้อม winner และข้อความแสดงผล
 * @param geojsonValue ค่า GeoJSON
 * @param pmtilesValue ค่า PMTiles
 * @param lowerIsBetter true = ค่าน้อยดีกว่า (เช่น load time, file size)
 * @param unit หน่วยสำหรับแสดงใน diffText (เช่น "ms", "KB")
 */
export function computeMetricDiff(
  geojsonValue: number,
  pmtilesValue: number,
  lowerIsBetter: boolean,
  unit: string
): MetricDiffResult {
  const diff = pmtilesValue - geojsonValue;
  const diffPercent =
    geojsonValue > 0 ? ((diff / geojsonValue) * 100).toFixed(1) : "—";

  const winner: MetricWinner =
    diff === 0
      ? "draw"
      : lowerIsBetter
        ? diff < 0
          ? "pmtiles"
          : "geojson"
        : diff > 0
          ? "pmtiles"
          : "geojson";

  const diffText =
    winner === "draw"
      ? "—"
      : lowerIsBetter && diff !== 0
        ? diff < 0
          ? `เร็วขึ้น ${Math.abs(diff).toLocaleString("en-US", { maximumFractionDigits: 0 })} ${unit} (${Math.abs(parseFloat(diffPercent)).toFixed(0)}%)`
          : `ช้าลง ${Math.abs(diff).toLocaleString("en-US", { maximumFractionDigits: 0 })} ${unit} (${diffPercent}%)`
        : `${diff > 0 ? "+" : ""}${diffPercent}%`;

  return { diff, diffPercent, winner, diffText };
}

/** Network speed config สำหรับประมาณเวลาโหลดตามความเร็วเครือข่าย */
export const NETWORK_SPEEDS = [
  { label: "3G ช้า (1 Mbps)", mbps: 1 },
  { label: "3G (3 Mbps)", mbps: 3 },
  { label: "4G (10 Mbps)", mbps: 10 },
  { label: "WiFi (50 Mbps)", mbps: 50 },
] as const;

/**
 * คำนวณเวลาโหลด (วินาที) ตามความเร็วเครือข่าย
 * @param fileSizeKb ขนาดไฟล์เป็น KB
 * @param mbps ความเร็วเครือข่ายเป็น Mbps
 * @returns เวลาโหลดเป็นวินาที
 */
export function computeLoadTimeByNetwork(
  fileSizeKb: number,
  mbps: number
): number {
  const mb = fileSizeKb / 1024;
  const mbPerSec = mbps / 8; // Mbps → MB/s
  return mb / mbPerSec;
}

/**
 * คำนวณ % ที่ PMTiles เร็วกว่า GeoJSON ตามความเร็วเครือข่าย
 * PMTiles โหลดเฉพาะ viewport (~15% ของไฟล์)
 */
export function computeNetworkSpeedDiffPercent(
  geojsonFileSizeKb: number,
  pmtilesFileSizeKb: number,
  mbps: number
): number {
  const geojsonSec = computeLoadTimeByNetwork(geojsonFileSizeKb, mbps);
  const pmtilesViewportKb = pmtilesFileSizeKb * 0.15;
  const pmtilesSec = computeLoadTimeByNetwork(pmtilesViewportKb, mbps);
  return geojsonSec > 0 ? ((geojsonSec - pmtilesSec) / geojsonSec) * 100 : 0;
}
