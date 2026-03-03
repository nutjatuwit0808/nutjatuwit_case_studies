"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { MapMetrics } from "@/types/map";
import { MAP_CENTER, MAP_STYLE, MAP_ZOOM } from "@/lib/map-config";
import { MapErrorOverlay } from "./MapErrorOverlay";

const GEOJSON_URL = "/data/sample.geojson";

interface GeoJSONMapProps {
  onMetricsReady: (metrics: MapMetrics) => void;
}

export function GeoJSONMap({ onMetricsReady }: GeoJSONMapProps) {
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
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load GeoJSON");
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
