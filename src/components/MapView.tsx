"use client";

import { useRef, useState, useEffect } from "react";
import Map from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export default function MapView() {
  const containerRef = useRef<HTMLDivElement>(null);
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

  return (
    <div ref={containerRef} className="absolute inset-0">
      {dimensions.width > 0 && dimensions.height > 0 && (
        <Map
          initialViewState={{
            longitude: -98.5795,
            latitude: 39.8283,
            zoom: 4,
          }}
          style={{ width: dimensions.width, height: dimensions.height }}
          mapStyle="mapbox://styles/mapbox/navigation-night-v1"
          mapboxAccessToken={MAPBOX_TOKEN}
        />
      )}
    </div>
  );
}
