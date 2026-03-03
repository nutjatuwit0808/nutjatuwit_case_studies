"use client";

import { useCallback } from "react";
import mapboxgl from "mapbox-gl";
import { PmTilesSource } from "mapbox-pmtiles/dist/mapbox-pmtiles.js";
import type { MapMetrics } from "@/types/map";
import { useMapboxMap } from "@/hooks/useMapboxMap";
import { MapErrorOverlay } from "./MapErrorOverlay";

const PMTILES_URL = "/api/pmtiles/sample.pmtiles";

interface PMTilesMapProps {
  onMetricsReady: (metrics: MapMetrics) => void;
}

/** ลงทะเบียน PmTiles source type ให้ Mapbox GL รู้จัก — ต้องเรียกก่อนสร้าง map */
function registerPmTilesSource() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mapboxgl.Style.setSourceType(PmTilesSource.SOURCE_TYPE, PmTilesSource as any);
}

export function PMTilesMap({ onMetricsReady }: PMTilesMapProps) {
  const onLoad = useCallback(
    async (map: mapboxgl.Map, loadStartTime: number) => {
      const header = await PmTilesSource.getHeader(PMTILES_URL);
      const bounds: [number, number, number, number] = [
        header.minLon,
        header.minLat,
        header.maxLon,
        header.maxLat,
      ];

      const headerFetchEnd = performance.now();

      map.addSource("pmtiles-source", {
        type: PmTilesSource.SOURCE_TYPE,
        url: PMTILES_URL,
        minzoom: header.minZoom,
        maxzoom: header.maxZoom,
        bounds,
      } as never);

      map.addLayer({
        id: "pmtiles-points",
        source: "pmtiles-source",
        "source-layer": "sample",
        type: "circle",
        paint: {
          "circle-color": "#10b981",
          "circle-radius": 6,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      });

      map.once("idle", async () => {
        const loadEndTime = performance.now();
        const loadTimeMs = loadEndTime - loadStartTime;
        const timeToFirstPaintMs = loadEndTime - headerFetchEnd;

        let fileSizeKb = 0;
        try {
          const sizeResponse = await fetch(PMTILES_URL, { method: "HEAD" });
          const contentLength = sizeResponse.headers.get("Content-Length");
          fileSizeKb = contentLength
            ? parseInt(contentLength, 10) / 1024
            : 0;
        } catch {
          fileSizeKb = 0;
        }

        onMetricsReady({
          loadTimeMs,
          fileSizeKb,
          timeToFirstPaintMs,
        });
      });
    },
    [onMetricsReady]
  );

  const { containerRef, error, mapContainerClassName, mapWrapperClassName } =
    useMapboxMap({
      onLoad,
      registerSourceType: registerPmTilesSource,
    });

  return (
    <div className={mapWrapperClassName}>
      {error && <MapErrorOverlay message={error} />}
      <div ref={containerRef} className={mapContainerClassName} />
    </div>
  );
}
