"use client";

import { Marker } from "react-map-gl/mapbox";

interface UserLocationDotProps {
  longitude: number;
  latitude: number;
}

export default function UserLocationDot({ longitude, latitude }: UserLocationDotProps) {
  return (
    <Marker longitude={longitude} latitude={latitude} anchor="center">
      <div className="relative flex items-center justify-center">
        {/* Pulsing outer ring */}
        <div className="absolute h-8 w-8 animate-ping rounded-full bg-blue-500/30" />
        {/* Solid outer ring */}
        <div className="absolute h-6 w-6 rounded-full bg-blue-500/20" />
        {/* Inner dot */}
        <div className="relative h-3.5 w-3.5 rounded-full border-2 border-white bg-blue-500 shadow-md" />
      </div>
    </Marker>
  );
}
