"use client";

import type { MapMetrics } from "@/types/map";
import { formatLoadTime, formatNumber } from "@/lib/format";

interface PerformanceMetricsProps {
  geojsonMetrics: MapMetrics | null;
  pmtilesMetrics: MapMetrics | null;
}

/** Network speeds in Mbps → MB/s */
const NETWORK_SPEEDS = [
  { label: "3G ช้า (1 Mbps)", mbps: 1 },
  { label: "3G (3 Mbps)", mbps: 3 },
  { label: "4G (10 Mbps)", mbps: 10 },
  { label: "WiFi (50 Mbps)", mbps: 50 },
] as const;

function MetricRow({
  label,
  geojsonValue,
  pmtilesValue,
  unit,
  decimals = 2,
  lowerIsBetter = true,
}: {
  label: string;
  geojsonValue: number;
  pmtilesValue: number;
  unit: string;
  decimals?: number;
  lowerIsBetter?: boolean;
}) {
  const diff = pmtilesValue - geojsonValue;
  const diffPercent =
    geojsonValue > 0 ? ((diff / geojsonValue) * 100).toFixed(1) : "—";
  const winner =
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

  return (
    <tr className="border-b border-zinc-200 dark:border-zinc-700">
      <td className="py-2 pr-4 font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </td>
      <td className="py-2 px-4 text-right font-mono tabular-nums">
        {formatNumber(geojsonValue, decimals, unit)}
      </td>
      <td className="py-2 px-4 text-right font-mono tabular-nums">
        {formatNumber(pmtilesValue, decimals, unit)}
      </td>
      <td className="py-2 px-4 text-right">
        <span
          className={
            winner === "draw"
              ? "text-zinc-500"
              : winner === "pmtiles"
                ? "font-medium text-emerald-600 dark:text-emerald-400"
                : "font-medium text-blue-600 dark:text-blue-400"
          }
        >
          {diffText}
        </span>
      </td>
    </tr>
  );
}

export function PerformanceMetrics({
  geojsonMetrics,
  pmtilesMetrics,
}: PerformanceMetricsProps) {
  const bothReady = geojsonMetrics && pmtilesMetrics;

  if (!bothReady) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          โหลดแผนที่ทั้งสองฝั่งเพื่อดูการเปรียบเทียบเชิงตัวเลข
        </p>
      </div>
    );
  }

  const loadTimeRatio =
    pmtilesMetrics.loadTimeMs > 0
      ? geojsonMetrics.loadTimeMs / pmtilesMetrics.loadTimeMs
      : 0;
  const pmtilesFaster = loadTimeRatio > 1.1;
  const geojsonFaster = loadTimeRatio < 0.9;
  const speedSummary = pmtilesFaster
    ? `PMTiles เร็วกว่า GeoJSON ${loadTimeRatio.toFixed(1)} เท่า`
    : geojsonFaster
      ? `GeoJSON เร็วกว่า PMTiles ${(1 / loadTimeRatio).toFixed(1)} เท่า`
      : null;

  return (
    <div className="space-y-4">
      {speedSummary && (
        <div
          className={`rounded-lg border-2 px-4 py-3 ${
            pmtilesFaster
              ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/30"
              : "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/30"
          }`}
        >
          <p
            className={`text-center text-base font-semibold ${
              pmtilesFaster
                ? "text-emerald-800 dark:text-emerald-200"
                : "text-blue-800 dark:text-blue-200"
            }`}
          >
            {speedSummary}
          </p>
        </div>
      )}
      <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800">
              <th className="py-3 pr-4 text-left font-semibold text-zinc-700 dark:text-zinc-300">
                Metric
              </th>
              <th className="py-3 px-4 text-right font-semibold text-blue-600 dark:text-blue-400">
                GeoJSON
              </th>
              <th className="py-3 px-4 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                PMTiles
              </th>
              <th className="py-3 px-4 text-right font-semibold text-zinc-700 dark:text-zinc-300">
                ผลต่าง
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-zinc-900">
            <MetricRow
              label="Load Time"
              geojsonValue={geojsonMetrics.loadTimeMs}
              pmtilesValue={pmtilesMetrics.loadTimeMs}
              unit="ms"
              decimals={0}
              lowerIsBetter
            />
            <MetricRow
              label="File Size"
              geojsonValue={geojsonMetrics.fileSizeKb}
              pmtilesValue={pmtilesMetrics.fileSizeKb}
              unit="KB"
              lowerIsBetter
            />
            <MetricRow
              label="Time to First Paint"
              geojsonValue={geojsonMetrics.timeToFirstPaintMs}
              pmtilesValue={pmtilesMetrics.timeToFirstPaintMs}
              unit="ms"
              decimals={0}
              lowerIsBetter
            />
          </tbody>
        </table>
      </div>

      <div className="space-y-2 border-t-2 border-zinc-200 dark:border-zinc-700 pt-2">
        <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          ประมาณเวลาโหลดตามความเร็วเครือข่าย (Real world case)
        </h4>
        <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800">
                <th className="py-2 pr-4 text-left font-semibold text-zinc-700 dark:text-zinc-300">
                  เครือข่าย
                </th>
                <th className="py-2 px-4 text-right font-semibold text-blue-600 dark:text-blue-400">
                  GeoJSON ({geojsonMetrics.fileSizeKb.toFixed(0)} KB)
                </th>
                <th className="py-2 px-4 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                  PMTiles (~{Math.round(pmtilesMetrics.fileSizeKb * 0.15).toLocaleString()} KB viewport)
                </th>
                <th className="py-2 px-4 text-right font-semibold text-zinc-700 dark:text-zinc-300">
                  ผลต่าง (%)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-zinc-900">
              {NETWORK_SPEEDS.map(({ label, mbps }) => {
                const geojsonMb = geojsonMetrics.fileSizeKb / 1024;
                const pmtilesViewportKb = pmtilesMetrics.fileSizeKb * 0.15;
                const pmtilesMb = pmtilesViewportKb / 1024;
                const mbPerSec = mbps / 8;
                const geojsonSec = geojsonMb / mbPerSec;
                const pmtilesSec = pmtilesMb / mbPerSec;
                const diffPercent =
                  geojsonSec > 0
                    ? ((geojsonSec - pmtilesSec) / geojsonSec) * 100
                    : 0;
                return (
                  <tr
                    key={mbps}
                    className="border-b border-zinc-200 dark:border-zinc-700 last:border-0"
                  >
                    <td className="py-2 pr-4 font-medium text-zinc-700 dark:text-zinc-300">
                      {label}
                    </td>
                    <td className="py-2 px-4 text-right font-mono tabular-nums text-blue-600 dark:text-blue-400">
                      {formatLoadTime(geojsonSec)}
                    </td>
                    <td className="py-2 px-4 text-right font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                      {formatLoadTime(pmtilesSec)}
                    </td>
                    <td className="py-2 px-4 text-right font-medium tabular-nums text-emerald-600 dark:text-emerald-400">
                      เร็วขึ้น {diffPercent.toFixed(0)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          PMTiles โหลดเฉพาะ tile ที่มองเห็น (~15% ของไฟล์) ไม่ใช่ทั้งไฟล์
        </p>
      </div>

      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        <strong>หมายเหตุ:</strong> ตัวเลขนี้วัดจาก localhost — bandwidth สูงมาก
        (~1–10 GB/s) จึงอาจไม่เห็นความต่างชัดเจน ใน production หรือเครือข่ายช้า
        (3G/4G) PMTiles มักจะเร็วกว่า GeoJSON เพราะโหลดเฉพาะ tile ที่มองเห็น
        แทนที่จะโหลดไฟล์ทั้งหมด
      </p>
    </div>
  );
}
