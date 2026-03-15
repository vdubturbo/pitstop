"use client";

import { useState, useCallback } from "react";
import MapView from "@/components/MapView";
import NeedToGoButton from "@/components/NeedToGoButton";
import RouteInput from "@/components/RouteInput";
import ResultsDrawer from "@/components/ResultsDrawer";
import type { Location } from "@/types";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export default function Home() {
  const [origin, setOrigin] = useState<Location | null>(null);
  const [destination, setDestination] = useState<Location | null>(null);
  const [routeGeometry, setRouteGeometry] = useState<GeoJSON.LineString | null>(null);
  const [isRouteActive, setIsRouteActive] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const fetchRoute = useCallback(async () => {
    if (!origin || !destination) return;

    const [oLng, oLat] = origin.coordinates;
    const [dLng, dLat] = destination.coordinates;

    const res = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${oLng},${oLat};${dLng},${dLat}?geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`
    );
    const data = await res.json();
    const route = data.routes?.[0];

    if (route) {
      setRouteGeometry(route.geometry as GeoJSON.LineString);
      setIsRouteActive(true);
    }
  }, [origin, destination]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <MapView
        origin={origin}
        destination={destination}
        routeGeometry={routeGeometry}
      />

      {/* "I Need To Go" — only when route is active and results aren't showing */}
      {!showResults && (
        <div
          className="absolute left-0 right-0 flex justify-center px-6"
          style={{
            bottom: isRouteActive ? 140 : 140,
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
          }}
        >
          <NeedToGoButton
            onPress={() => setShowResults(true)}
            disabled={!isRouteActive}
          />
        </div>
      )}

      {/* Route input — always present at bottom */}
      {!showResults && (
        <div className="absolute bottom-0 left-0 right-0">
          <RouteInput
            origin={origin}
            destination={destination}
            onOriginChange={setOrigin}
            onDestinationChange={setDestination}
            onSubmit={fetchRoute}
            isRouteActive={isRouteActive}
          />
        </div>
      )}

      {/* Results drawer */}
      {showResults && (
        <div className="absolute bottom-0 left-0 right-0">
          <ResultsDrawer onClose={() => setShowResults(false)} />
        </div>
      )}
    </div>
  );
}
