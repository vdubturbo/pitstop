"use client";

import { useState } from "react";
import MapView from "@/components/MapView";
import NeedToGoButton from "@/components/NeedToGoButton";
import RouteInput from "@/components/RouteInput";
import ResultsDrawer from "@/components/ResultsDrawer";

export default function Home() {
  const [showRouteInput, setShowRouteInput] = useState(false);
  const [showResults, setShowResults] = useState(false);

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Map fills the mobile container */}
      <MapView />

      {/* Main CTA */}
      {!showRouteInput && !showResults && (
        <div
          className="absolute bottom-8 left-0 right-0 flex justify-center px-6"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
          <NeedToGoButton onPress={() => setShowRouteInput(true)} />
        </div>
      )}

      {/* Route input bottom sheet */}
      {showRouteInput && (
        <div className="absolute bottom-0 left-0 right-0">
          <RouteInput
            onClose={() => setShowRouteInput(false)}
            onSearch={() => {
              setShowRouteInput(false);
              setShowResults(true);
            }}
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
