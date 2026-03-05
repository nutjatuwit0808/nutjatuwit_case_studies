"use client";

import { useCallback, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useMapboxMap } from "@/hooks/useMapboxMap";
import { MapErrorOverlay } from "./MapErrorOverlay";
import { createVehicleMarkerElement, updateMarkerStyle } from "@/lib/marker-helpers";
import type { GpsUpdate } from "@/types/websocket";

interface VehicleMapProps {
  vehicles: Map<string, GpsUpdate>;
  alertedIds: Set<string>;
}

export function VehicleMap({ vehicles, alertedIds }: VehicleMapProps) {
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());

  const onLoad = useCallback((_map: mapboxgl.Map) => {
    // Map ready - callback for future extensions
  }, []);

  const { containerRef, mapRef, mapReady, error, mapContainerClassName, mapWrapperClassName } =
    useMapboxMap({ onLoad });

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    const currentIds = new Set(markersRef.current.keys());
    const newIds = new Set(vehicles.keys());

    currentIds.forEach((id) => {
      if (!newIds.has(id)) {
        markersRef.current.get(id)?.remove();
        markersRef.current.delete(id);
      }
    });

    vehicles.forEach((data, vehicleId) => {
      const isAlerted = alertedIds.has(vehicleId);
      let marker = markersRef.current.get(vehicleId);

      if (!marker) {
        const el = createVehicleMarkerElement(isAlerted);
        marker = new mapboxgl.Marker({ element: el })
          .setLngLat([data.lng, data.lat])
          .addTo(map);
        markersRef.current.set(vehicleId, marker);
      } else {
        marker.setLngLat([data.lng, data.lat]);
        updateMarkerStyle(marker, isAlerted);
      }
    });
  }, [vehicles, alertedIds, mapReady]);

  return (
    <div className={mapWrapperClassName}>
      {error && <MapErrorOverlay message={error} />}
      <div ref={containerRef} className={mapContainerClassName} />
    </div>
  );
}
