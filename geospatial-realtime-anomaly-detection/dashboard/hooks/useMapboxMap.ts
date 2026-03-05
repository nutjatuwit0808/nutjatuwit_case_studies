"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MAP_CENTER, MAP_STYLE, MAP_ZOOM } from "@/lib/map-config";

const MAP_CONTAINER_CLASS = "h-full w-full";
const MAP_WRAPPER_CLASS = "relative h-full min-h-[400px] w-full";

export interface UseMapboxMapOptions {
  onLoad: (map: mapboxgl.Map) => void | Promise<void>;
}

export interface UseMapboxMapReturn {
  containerRef: React.RefObject<HTMLDivElement | null>;
  mapRef: React.RefObject<mapboxgl.Map | null>;
  mapReady: boolean;
  error: string | null;
  mapContainerClassName: string;
  mapWrapperClassName: string;
}

export function useMapboxMap({ onLoad }: UseMapboxMapOptions): UseMapboxMapReturn {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onLoadRef = useRef(onLoad);
  onLoadRef.current = onLoad;

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!token) {
      setError("NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN is not set");
      return;
    }

    if (!containerRef.current) return;

    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: MAP_CENTER,
      zoom: MAP_ZOOM,
    });

    map.on("load", async () => {
      mapRef.current = map;
      setMapReady(true);
      try {
        await onLoadRef.current(map);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load map");
      }
    });

    map.on("error", (e) => {
      setError(e.error?.message || "Map error");
    });

    return () => {
      mapRef.current = null;
      setMapReady(false);
      map.remove();
    };
  }, []);

  return {
    containerRef,
    mapRef,
    mapReady,
    error,
    mapContainerClassName: MAP_CONTAINER_CLASS,
    mapWrapperClassName: MAP_WRAPPER_CLASS,
  };
}
