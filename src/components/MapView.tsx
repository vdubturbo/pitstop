"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Map, { Source, Layer, Marker } from "react-map-gl/mapbox";
import type { MapRef } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Location } from "@/types";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface MapViewProps {
  origin: Location | null;
  destination: Location | null;
  routeGeometry: GeoJSON.LineString | null;
}

export default function MapView({ origin, destination, routeGeometry }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapRef>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setDimensions({ width, height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Fit bounds when route geometry changes
  const fitRoute = useCallback(() => {
    const map = mapRef.current;
    if (!map || !routeGeometry) return;

    const coords = routeGeometry.coordinates as [number, number][];
    let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity;
    for (const [lng, lat] of coords) {
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    }

    map.fitBounds(
      [[minLng, minLat], [maxLng, maxLat]],
      { padding: { top: 60, bottom: 200, left: 40, right: 40 }, duration: 1000 }
    );
  }, [routeGeometry]);

  useEffect(() => {
    fitRoute();
  }, [fitRoute]);

  const routeGeoJSON: GeoJSON.Feature<GeoJSON.LineString> | null = routeGeometry
    ? { type: "Feature", properties: {}, geometry: routeGeometry }
    : null;

  return (
    <div ref={containerRef} className="absolute inset-0">
      {dimensions.width > 0 && dimensions.height > 0 && (
        <Map
          ref={mapRef}
          initialViewState={{
            longitude: -98.5795,
            latitude: 39.8283,
            zoom: 4,
          }}
          style={{ width: dimensions.width, height: dimensions.height }}
          mapStyle="mapbox://styles/mapbox/navigation-night-v1"
          mapboxAccessToken={MAPBOX_TOKEN}
        >
          {/* Route line */}
          {routeGeoJSON && (
            <Source id="route" type="geojson" data={routeGeoJSON}>
              <Layer
                id="route-line"
                type="line"
                paint={{
                  "line-color": "#f59e0b",
                  "line-width": 4,
                  "line-opacity": 0.9,
                }}
                layout={{
                  "line-join": "round",
                  "line-cap": "round",
                }}
              />
            </Source>
          )}

          {/* Origin marker */}
          {origin && (
            <Marker longitude={origin.coordinates[0]} latitude={origin.coordinates[1]} anchor="center">
              <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-green-500 shadow-md" />
            </Marker>
          )}

          {/* Destination marker */}
          {destination && (
            <Marker longitude={destination.coordinates[0]} latitude={destination.coordinates[1]} anchor="center">
              <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-red-500 shadow-md" />
            </Marker>
          )}
        </Map>
      )}
    </div>
  );
}
