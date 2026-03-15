"use client";

import { useState, useCallback, useEffect } from "react";
import MapView from "@/components/MapView";
import NeedToGoButton from "@/components/NeedToGoButton";
import RouteInput from "@/components/RouteInput";
import ResultsDrawer from "@/components/ResultsDrawer";
import type { Location, BathroomResult } from "@/types";
import { queryOverpass } from "@/lib/overpass";
import {
  nearestPointOnRoute,
  distanceAlongRoute,
  minDistanceToRoute,
  interpolateAlongRoute,
} from "@/lib/geo";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export default function Home() {
  const [origin, setOrigin] = useState<Location | null>(null);
  const [destination, setDestination] = useState<Location | null>(null);
  const [routeGeometry, setRouteGeometry] = useState<GeoJSON.LineString | null>(null);
  const [isRouteActive, setIsRouteActive] = useState(false);

  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [bathroomResults, setBathroomResults] = useState<BathroomResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [selectedResult, setSelectedResult] = useState<BathroomResult | null>(null);

  // DEV MODE: tap the map to set fake user location
  const handleMapClick = useCallback(
    (lngLat: [number, number]) => {
      if (!isRouteActive) return;
      console.log("[PitStop] Dev: setting user location to", lngLat);
      setUserLocation(lngLat);
    },
    [isRouteActive]
  );

  // Fallback: place user at 25% along route when route becomes active
  useEffect(() => {
    if (userLocation) return;
    if (!routeGeometry || !isRouteActive) return;

    const coords = routeGeometry.coordinates as [number, number][];
    const fallback = interpolateAlongRoute(coords, 0.25);
    console.log("[PitStop] Dev: fallback user location at 25% along route", fallback);
    setUserLocation(fallback);
  }, [routeGeometry, isRouteActive, userLocation]);

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
      // Reset previous results
      setBathroomResults([]);
      setShowResults(false);
      setSelectedResult(null);
      setSearchError(null);
    }
  }, [origin, destination]);

  const handleNeedToGo = useCallback(async () => {
    if (!routeGeometry || !userLocation) return;

    setIsSearching(true);
    setSearchError(null);
    setShowResults(true);
    setBathroomResults([]);
    setSelectedResult(null);

    const routeCoords = routeGeometry.coordinates as [number, number][];
    const userOnRoute = nearestPointOnRoute(userLocation, routeCoords);

    console.log("[PitStop] User location:", userLocation);
    console.log("[PitStop] User nearest route index:", userOnRoute.index, "of", routeCoords.length, "points");
    console.log("[PitStop] User distance from route:", userOnRoute.distance.toFixed(2), "miles");

    try {
      console.log("[PitStop] Querying Overpass at lat:", userLocation[1], "lon:", userLocation[0]);
      const rawResults = await queryOverpass(userLocation[1], userLocation[0]);
      console.log("[PitStop] Overpass returned", rawResults.length, "raw results:", rawResults);

      // Filter and rank results
      const ranked: BathroomResult[] = [];
      let filteredDetour = 0;
      let filteredBehind = 0;

      for (const r of rawResults) {
        const stopCoords: [number, number] = [r.lon, r.lat];

        // Find where this stop is closest to the route
        const { distance: detourMiles, nearestIndex } = minDistanceToRoute(
          stopCoords,
          routeCoords
        );

        // Convert to detour minutes (1 mile ≈ 1 minute at 60mph)
        const detourMinutes = detourMiles;

        // Only include stops within 10 minutes detour from the route
        if (detourMinutes > 10) {
          filteredDetour++;
          console.log("[PitStop] Filtered (detour too far):", r.name, "detour:", detourMinutes.toFixed(1), "min");
          continue;
        }

        // Only include stops that are ahead of the user on the route
        if (nearestIndex <= userOnRoute.index) {
          filteredBehind++;
          console.log("[PitStop] Filtered (behind user):", r.name, "routeIndex:", nearestIndex, "vs user:", userOnRoute.index);
          continue;
        }

        // Calculate miles ahead on route from user's position
        const milesAhead = distanceAlongRoute(routeCoords, userOnRoute.index, nearestIndex);

        console.log("[PitStop] Keeping:", r.name, "detour:", detourMinutes.toFixed(1), "min, ahead:", milesAhead.toFixed(1), "mi");

        ranked.push({
          name: r.name,
          brand: r.brand,
          coordinates: stopCoords,
          detourMinutes,
          milesAhead,
        });
      }

      console.log("[PitStop] Filtering summary — too far detour:", filteredDetour, "behind user:", filteredBehind, "kept:", ranked.length);

      // Sort by detour time, take top 5
      ranked.sort((a, b) => a.detourMinutes - b.detourMinutes);
      const top5 = ranked.slice(0, 5);
      console.log("[PitStop] Final results:", top5);
      setBathroomResults(top5);
    } catch (err) {
      console.error("[PitStop] Search error:", err);
      setSearchError(
        err instanceof Error ? err.message : "Failed to search for stops. Please try again."
      );
    } finally {
      setIsSearching(false);
    }
  }, [routeGeometry, userLocation]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <MapView
        origin={origin}
        destination={destination}
        routeGeometry={routeGeometry}
        userLocation={userLocation}
        selectedResult={selectedResult}
        onMapClick={handleMapClick}
      />

      {/* "I Need To Go" button — visible above the bottom sheet/drawer */}
      <div
        className="absolute left-0 right-0 flex justify-center px-6"
        style={{
          bottom: showResults ? "55dvh" : 140,
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
          transition: "bottom 0.3s ease",
        }}
      >
        <NeedToGoButton
          onPress={handleNeedToGo}
          disabled={!isRouteActive}
        />
      </div>

      {/* Route input — visible when results aren't showing */}
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
          <ResultsDrawer
            results={bathroomResults}
            isSearching={isSearching}
            error={searchError}
            selectedResult={selectedResult}
            onSelectResult={setSelectedResult}
            onClose={() => {
              setShowResults(false);
              setSelectedResult(null);
            }}
          />
        </div>
      )}
    </div>
  );
}
