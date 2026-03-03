"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MAP_CENTER, MAP_STYLE, MAP_ZOOM } from "@/lib/map-config";

/** ค่าเริ่มต้นสำหรับการ init แผนที่ — ใช้ร่วมกันระหว่าง GeoJSON และ PMTiles */
const MAP_CONTAINER_CLASS = "h-full w-full";
const MAP_WRAPPER_CLASS = "relative h-full min-h-[300px] w-full";

export interface UseMapboxMapOptions {
  /** เรียกเมื่อ map โหลดเสร็จ — รับ map instance และ loadStartTime (ms) สำหรับคำนวณ metrics */
  onLoad: (map: mapboxgl.Map, loadStartTime: number) => void | Promise<void>;
  /** ลงทะเบียน source type ก่อนสร้าง map (เช่น PmTilesSource) — optional */
  registerSourceType?: () => void;
}

export interface UseMapboxMapReturn {
  containerRef: React.RefObject<HTMLDivElement | null>;
  error: string | null;
  mapContainerClassName: string;
  mapWrapperClassName: string;
}

/**
 * Hook สำหรับ setup แผนที่ Mapbox GL — แชร์ logic: token check, init, error handling, cleanup
 * ใช้ร่วมกันระหว่าง GeoJSONMap และ PMTilesMap
 */
export function useMapboxMap({
  onLoad,
  registerSourceType,
}: UseMapboxMapOptions): UseMapboxMapReturn {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!token) {
      setError("NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN is not set");
      return;
    }

    if (!containerRef.current) return;

    mapboxgl.accessToken = token;
    registerSourceType?.();

    const loadStartTime = performance.now();
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: MAP_CENTER,
      zoom: MAP_ZOOM,
    });

    map.on("load", async () => {
      try {
        await onLoad(map, loadStartTime);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load map");
      }
    });

    map.on("error", (e) => {
      setError(e.error?.message || "Map error");
    });

    return () => {
      map.remove();
    };
  }, [onLoad, registerSourceType]);

  return {
    containerRef,
    error,
    mapContainerClassName: MAP_CONTAINER_CLASS,
    mapWrapperClassName: MAP_WRAPPER_CLASS,
  };
}
