"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Map, { Source, Layer, Marker } from "react-map-gl/mapbox";
import type { MapRef } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Location, BathroomResult } from "@/types";
import UserLocationDot from "./UserLocationDot";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface MapViewProps {
  origin: Location | null;
  destination: Location | null;
  routeGeometry: GeoJSON.LineString | null;
  userLocation: [number, number] | null;
  selectedResult: BathroomResult | null;
  onMapClick?: (lngLat: [number, number]) => void;
}

export default function MapView({
  origin,
  destination,
  routeGeometry,
  userLocation,
  selectedResult,
  onMapClick,
}: MapViewProps) {
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
    let minLng = Infinity,
      maxLng = -Infinity,
      minLat = Infinity,
      maxLat = -Infinity;
    for (const [lng, lat] of coords) {
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    }

    map.fitBounds(
      [
        [minLng, minLat],
        [maxLng, maxLat],
      ],
      { padding: { top: 60, bottom: 200, left: 40, right: 40 }, duration: 1000 }
    );
  }, [routeGeometry]);

  useEffect(() => {
    fitRoute();
  }, [fitRoute]);

  // Zoom to show selected result relative to user location
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedResult) return;

    const points: [number, number][] = [selectedResult.coordinates];
    if (userLocation) points.push(userLocation);

    if (points.length === 1) {
      map.flyTo({
        center: points[0],
        zoom: 14,
        duration: 800,
      });
    } else {
      let minLng = Infinity,
        maxLng = -Infinity,
        minLat = Infinity,
        maxLat = -Infinity;
      for (const [lng, lat] of points) {
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
      }
      map.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat],
        ],
        { padding: { top: 80, bottom: 300, left: 60, right: 60 }, duration: 800 }
      );
    }
  }, [selectedResult, userLocation]);

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
          onClick={(e) => {
            if (onMapClick) {
              onMapClick([e.lngLat.lng, e.lngLat.lat]);
            }
          }}
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
            <Marker
              longitude={origin.coordinates[0]}
              latitude={origin.coordinates[1]}
              anchor="center"
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-green-500 shadow-md" />
            </Marker>
          )}

          {/* Destination marker */}
          {destination && (
            <Marker
              longitude={destination.coordinates[0]}
              latitude={destination.coordinates[1]}
              anchor="center"
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-red-500 shadow-md" />
            </Marker>
          )}

          {/* User location */}
          {userLocation && (
            <UserLocationDot longitude={userLocation[0]} latitude={userLocation[1]} />
          )}

          {/* Selected result pin */}
          {selectedResult && (
            <Marker
              longitude={selectedResult.coordinates[0]}
              latitude={selectedResult.coordinates[1]}
              anchor="bottom"
            >
              <div className="flex flex-col items-center">
                <div className="rounded-lg bg-amber-500 px-2 py-1 text-xs font-bold text-black shadow-lg">
                  {selectedResult.name.split(" ").slice(0, 2).join(" ")}
                </div>
                <div className="h-0 w-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-amber-500" />
              </div>
            </Marker>
          )}
        </Map>
      )}
    </div>
  );
}
