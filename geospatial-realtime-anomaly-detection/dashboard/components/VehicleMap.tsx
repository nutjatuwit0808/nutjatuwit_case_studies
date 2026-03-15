"use client";

import { useCallback, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useMapboxMap } from "@/hooks/useMapboxMap";
import { MapErrorOverlay } from "./MapErrorOverlay";
import { createVehicleMarkerElement, updateMarkerStyle } from "@/lib/marker-helpers";
import { translateAnomalyTypesToTooltip } from "@/lib/anomaly-translations";
import type { GpsUpdate } from "@/types/websocket";
import type { AlertPayload } from "@/types/websocket";

interface VehicleMapProps {
  vehicles: Map<string, GpsUpdate>;
  alertedIds: Set<string>;
  alertedAlerts: Map<string, AlertPayload>;
}

function VehicleMap({ vehicles, alertedIds, alertedAlerts }: VehicleMapProps) {
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const popupsRef = useRef<Map<string, mapboxgl.Popup>>(new Map());

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
        popupsRef.current.get(id)?.remove();
        popupsRef.current.delete(id);
      }
    });

    vehicles.forEach((data, vehicleId) => {
      const isAlerted = alertedIds.has(vehicleId);
      const alert = alertedAlerts.get(vehicleId);
      const tooltipText = isAlerted && alert?.anomaly_types?.length
        ? translateAnomalyTypesToTooltip(alert.anomaly_types)
        : undefined;
      let marker = markersRef.current.get(vehicleId);

      if (!marker) {
        const el = createVehicleMarkerElement(isAlerted, tooltipText, vehicleId);
        marker = new mapboxgl.Marker({ element: el })
          .setLngLat([data.lng, data.lat])
          .addTo(map);
        markersRef.current.set(vehicleId, marker);
      } else {
        marker.setLngLat([data.lng, data.lat]);
        updateMarkerStyle(marker, isAlerted, tooltipText);
      }

      if (isAlerted && tooltipText) {
        let popup = popupsRef.current.get(vehicleId);
        if (!popup) {
          popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false,
            className: "vehicle-alert-popup",
          });
          popupsRef.current.set(vehicleId, popup);
        }
        const html = tooltipText.replace(/\n/g, "<br>");
        popup.setLngLat([data.lng, data.lat]).setHTML(html).addTo(map);
      } else {
        popupsRef.current.get(vehicleId)?.remove();
        popupsRef.current.delete(vehicleId);
      }
    });
  }, [vehicles, alertedIds, alertedAlerts, mapReady]);

  return (
    <div className={mapWrapperClassName}>
      {error && <MapErrorOverlay message={error} />}
      <div ref={containerRef} className={mapContainerClassName} />
    </div>
  );
}

export default VehicleMap;
