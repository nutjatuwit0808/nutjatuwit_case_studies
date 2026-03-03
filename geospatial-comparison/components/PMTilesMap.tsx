"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
// Use dist build to avoid transpilation issues with mapbox-pmtiles source
import { PmTilesSource } from "mapbox-pmtiles/dist/mapbox-pmtiles.js";
import "mapbox-gl/dist/mapbox-gl.css";
import type { MapMetrics } from "@/types/map";
import { MAP_CENTER, MAP_STYLE, MAP_ZOOM } from "@/lib/map-config";
import { MapErrorOverlay } from "./MapErrorOverlay";

const PMTILES_URL = "/api/pmtiles/sample.pmtiles";

interface PMTilesMapProps {
  onMetricsReady: (metrics: MapMetrics) => void;
}

export function PMTilesMap({ onMetricsReady }: PMTilesMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!token) {
      setError("NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN is not set");
      return;
    }

    if (!containerRef.current) return;

    mapboxgl.accessToken = token;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mapboxgl.Style.setSourceType(PmTilesSource.SOURCE_TYPE, PmTilesSource as any);

    const loadStartTime = performance.now();

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: MAP_CENTER,
      zoom: MAP_ZOOM,
    });

    mapRef.current = map;

    map.on("load", async () => {
      try {
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
            const sizeResponse = await fetch(PMTILES_URL, {
              method: "HEAD",
            });
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
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load PMTiles");
      }
    });

    map.on("error", (e) => {
      setError(e.error?.message || "Map error");
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [onMetricsReady]);

  return (
    <div className="relative h-full min-h-[300px] w-full">
      {error && <MapErrorOverlay message={error} />}
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
