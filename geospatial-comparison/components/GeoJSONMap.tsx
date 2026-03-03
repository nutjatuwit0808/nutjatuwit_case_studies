"use client";

import { useCallback } from "react";
import mapboxgl from "mapbox-gl";
import type { MapMetrics } from "@/types/map";
import { useMapboxMap } from "@/hooks/useMapboxMap";
import { MapErrorOverlay } from "./MapErrorOverlay";

const GEOJSON_URL = "/data/sample.geojson";

interface GeoJSONMapProps {
  onMetricsReady: (metrics: MapMetrics) => void;
}

export function GeoJSONMap({ onMetricsReady }: GeoJSONMapProps) {
  const onLoad = useCallback(
    async (map: mapboxgl.Map, loadStartTime: number) => {
      const fetchStart = performance.now();
      const response = await fetch(GEOJSON_URL);
      const data = await response.json();

      const contentLength = response.headers.get("Content-Length");
      const fileSizeBytes =
        (contentLength ? parseInt(contentLength, 10) : 0) ||
        new Blob([JSON.stringify(data)]).size;
      const fileSizeKb = fileSizeBytes / 1024;

      map.addSource("geojson-source", {
        type: "geojson",
        data,
      });

      map.addLayer({
        id: "geojson-points",
        source: "geojson-source",
        type: "circle",
        paint: {
          "circle-color": "#0ea5e9",
          "circle-radius": 6,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      });

      map.once("idle", () => {
        const loadEndTime = performance.now();
        const loadTimeMs = loadEndTime - loadStartTime;
        const timeToFirstPaintMs = loadEndTime - fetchStart;

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
    useMapboxMap({ onLoad });

  return (
    <div className={mapWrapperClassName}>
      {error && <MapErrorOverlay message={error} />}
      <div ref={containerRef} className={mapContainerClassName} />
    </div>
  );
}
