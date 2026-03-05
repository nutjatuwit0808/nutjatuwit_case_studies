"use client";

import { useCallback, useEffect, useRef } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import { useMapboxMap } from "@/hooks/useMapboxMap";
import {
  FLEET_LAYER_ID,
  FLEET_LAYER_LAYOUT,
  FLEET_POLL_INTERVAL_MS,
  FLEET_SOURCE_ID,
  FLEET_SOURCE_LAYER,
  getFleetTilesUrl,
  loadFleetIcon,
} from "@/lib/fleet-config";
import { MapErrorOverlay } from "./MapErrorOverlay";

export function FleetMap() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refreshSource = useCallback((map: mapboxgl.Map) => {
    if (map.getLayer(FLEET_LAYER_ID)) {
      map.removeLayer(FLEET_LAYER_ID);
    }
    if (map.getSource(FLEET_SOURCE_ID)) {
      map.removeSource(FLEET_SOURCE_ID);
    }

    map.addSource(FLEET_SOURCE_ID, {
      type: "vector",
      tiles: [getFleetTilesUrl()],
      minzoom: 5,
      maxzoom: 22,
    });

    map.addLayer({
      id: FLEET_LAYER_ID,
      type: "symbol",
      source: FLEET_SOURCE_ID,
      "source-layer": FLEET_SOURCE_LAYER,
      layout: FLEET_LAYER_LAYOUT,
    });
  }, []);

  const onLoad = useCallback(
    async (map: mapboxgl.Map) => {
      await loadFleetIcon(map);
      refreshSource(map);

      intervalRef.current = setInterval(() => {
        refreshSource(map);
      }, FLEET_POLL_INTERVAL_MS);
    },
    [refreshSource]
  );

  const { containerRef, error, mapContainerClassName, mapWrapperClassName } =
    useMapboxMap({ onLoad });

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className={mapWrapperClassName}>
      {error && <MapErrorOverlay message={error} />}
      <div ref={containerRef} className={mapContainerClassName} />
    </div>
  );
}
