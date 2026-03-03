"use client";

import { useState } from "react";
import type { MapMetrics } from "@/types/map";
import { GeoJSONMap } from "./GeoJSONMap";
import { PMTilesMap } from "./PMTilesMap";
import { MapCard } from "./MapCard";
import { PerformanceMetrics } from "./PerformanceMetrics";

export function MapComparison() {
  const [geojsonMetrics, setGeojsonMetrics] = useState<MapMetrics | null>(null);
  const [pmtilesMetrics, setPmtilesMetrics] = useState<MapMetrics | null>(null);

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <h2 className="mb-4 text-lg font-semibold text-zinc-800 dark:text-zinc-200">
          การเปรียบเทียบเชิงตัวเลข
        </h2>
        <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          ตัวอย่างนี้โหลดไฟล์จาก localhost จึงอาจไม่เห็นความต่างชัดเจน ใน
          production หรือเครือข่ายช้า ความต่างจะชัดเจนขึ้น
        </h4>
        <PerformanceMetrics
          geojsonMetrics={geojsonMetrics}
          pmtilesMetrics={pmtilesMetrics}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <MapCard
          title="GeoJSON"
          subtitle="โหลดจาก /data/sample.geojson"
          theme="blue"
          metrics={geojsonMetrics}
        >
          <GeoJSONMap onMetricsReady={setGeojsonMetrics} />
        </MapCard>

        <MapCard
          title="PMTiles"
          subtitle="โหลดจาก /api/pmtiles/sample.pmtiles"
          theme="emerald"
          metrics={pmtilesMetrics}
        >
          <PMTilesMap onMetricsReady={setPmtilesMetrics} />
        </MapCard>
      </div>
    </div>
  );
}
