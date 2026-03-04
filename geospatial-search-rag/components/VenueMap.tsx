"use client";

import { useCallback, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { useMapboxMap } from "@/hooks/useMapboxMap";
import { escapeHtml } from "@/lib/utils";
import { MapErrorOverlay } from "./MapErrorOverlay";
import type { VenueSearchResult } from "@/types/venue";

interface VenueMapProps {
  venues: VenueSearchResult[];
  flyToPoint?: { lat: number; lng: number } | null;
}

export function VenueMap({ venues, flyToPoint }: VenueMapProps) {
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  const onLoad = useCallback((map: mapboxgl.Map) => {
    // Map ready - markers will be updated via useEffect
  }, []);

  const { containerRef, mapRef, mapReady, error, mapContainerClassName, mapWrapperClassName } =
    useMapboxMap({ onLoad });

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    if (venues.length === 0) return;

    const bounds = new mapboxgl.LngLatBounds();

    venues.forEach((venue) => {
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
        `<div class="p-2 min-w-[200px]">
          <h3 class="font-semibold">${escapeHtml(venue.name)}</h3>
          ${venue.description ? `<p class="text-sm text-gray-600 mt-1">${escapeHtml(venue.description)}</p>` : ""}
        </div>`
      );

      const marker = new mapboxgl.Marker()
        .setLngLat([venue.lng, venue.lat])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
      bounds.extend([venue.lng, venue.lat]);
    });

    if (venues.length > 1) {
      map.fitBounds(bounds, { padding: 50, maxZoom: 16 });
    } else if (venues.length === 1) {
      map.flyTo({ center: [venues[0].lng, venues[0].lat], zoom: 15 });
    }
  }, [venues, mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || !flyToPoint) return;
    map.flyTo({
      center: [flyToPoint.lng, flyToPoint.lat],
      zoom: 15,
      duration: 1000,
    });
  }, [flyToPoint, mapReady]);

  return (
    <div className={mapWrapperClassName}>
      {error && <MapErrorOverlay message={error} />}
      <div ref={containerRef} className={mapContainerClassName} />
    </div>
  );
}
