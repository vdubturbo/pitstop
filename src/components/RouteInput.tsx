"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { Location } from "@/types";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface RouteInputProps {
  origin: Location | null;
  destination: Location | null;
  onOriginChange: (loc: Location | null) => void;
  onDestinationChange: (loc: Location | null) => void;
  onSubmit: () => void;
  isRouteActive: boolean;
}

interface Suggestion {
  id: string;
  place_name: string;
  center: [number, number];
}

function useGeocoder(onSelect: (loc: Location) => void) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const search = useCallback((text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (text.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(text)}.json?access_token=${MAPBOX_TOKEN}&autocomplete=true&limit=5&country=us`
      );
      const data = await res.json();
      setSuggestions(data.features ?? []);
      setShowSuggestions(true);
    }, 300);
  }, []);

  const select = useCallback(
    (s: Suggestion) => {
      setQuery(s.place_name);
      setSuggestions([]);
      setShowSuggestions(false);
      onSelect({ label: s.place_name, coordinates: s.center });
    },
    [onSelect]
  );

  const clear = useCallback(() => {
    setQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
  }, []);

  return { query, setQuery, suggestions, showSuggestions, setShowSuggestions, search, select, clear };
}

export default function RouteInput({
  origin,
  destination,
  onOriginChange,
  onDestinationChange,
  onSubmit,
  isRouteActive,
}: RouteInputProps) {
  const [expanded, setExpanded] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  const fromGeo = useGeocoder(onOriginChange);
  const toGeo = useGeocoder(onDestinationChange);

  // Sync display text when props change externally (e.g. swap)
  useEffect(() => {
    fromGeo.setQuery(origin?.label ?? "");
  }, [origin]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    toGeo.setQuery(destination?.label ?? "");
  }, [destination]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSwap = () => {
    const prevOrigin = origin;
    const prevDest = destination;
    onOriginChange(prevDest);
    onDestinationChange(prevOrigin);
  };

  const canSubmit = origin !== null && destination !== null;

  return (
    <div
      ref={sheetRef}
      className="rounded-t-2xl bg-zinc-900 shadow-2xl transition-all duration-300"
      style={{ paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom, 0px))" }}
    >
      {/* Drag handle — tapping toggles expanded */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full justify-center pt-3 pb-2"
        aria-label={expanded ? "Collapse route input" : "Expand route input"}
      >
        <div className="h-1 w-10 rounded-full bg-zinc-700" />
      </button>

      {/* Collapsed state: just the button */}
      {!expanded && (
        <div className="px-5 pb-2">
          <button
            onClick={() => setExpanded(true)}
            className="w-full rounded-xl bg-zinc-800 px-4 py-3.5 text-left text-base text-zinc-500"
            style={{ minHeight: 48 }}
          >
            {isRouteActive
              ? `${origin?.label?.split(",")[0]} → ${destination?.label?.split(",")[0]}`
              : "Where are you headed?"}
          </button>
        </div>
      )}

      {/* Expanded state: full form */}
      {expanded && (
        <div className="px-5">
          {/* From / To inputs with swap */}
          <div className="relative mb-4">
            {/* From */}
            <div className="relative mb-2">
              <label className="mb-1 block text-xs font-medium text-zinc-500">From</label>
              <input
                type="text"
                value={fromGeo.query}
                onChange={(e) => fromGeo.search(e.target.value)}
                onFocus={() => {
                  if (fromGeo.suggestions.length > 0) fromGeo.setShowSuggestions(true);
                }}
                onBlur={() => setTimeout(() => fromGeo.setShowSuggestions(false), 200)}
                placeholder="Starting point"
                className="w-full rounded-xl bg-zinc-800 px-4 py-3.5 pr-12 text-base text-zinc-100 placeholder-zinc-600 outline-none focus:ring-2 focus:ring-amber-500/50"
                style={{ minHeight: 48 }}
              />
              {fromGeo.query && (
                <button
                  onClick={() => {
                    fromGeo.clear();
                    onOriginChange(null);
                  }}
                  className="absolute right-3 top-[calc(50%+8px)] -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full text-zinc-500 active:text-zinc-300"
                >
                  ✕
                </button>
              )}
              {fromGeo.showSuggestions && fromGeo.suggestions.length > 0 && (
                <SuggestionList suggestions={fromGeo.suggestions} onSelect={fromGeo.select} />
              )}
            </div>

            {/* Swap button */}
            <button
              onClick={handleSwap}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-700 text-zinc-300 active:bg-zinc-600"
              aria-label="Swap origin and destination"
            >
              ⇅
            </button>

            {/* To */}
            <div className="relative">
              <label className="mb-1 block text-xs font-medium text-zinc-500">To</label>
              <input
                type="text"
                value={toGeo.query}
                onChange={(e) => toGeo.search(e.target.value)}
                onFocus={() => {
                  if (toGeo.suggestions.length > 0) toGeo.setShowSuggestions(true);
                }}
                onBlur={() => setTimeout(() => toGeo.setShowSuggestions(false), 200)}
                placeholder="Destination"
                className="w-full rounded-xl bg-zinc-800 px-4 py-3.5 pr-12 text-base text-zinc-100 placeholder-zinc-600 outline-none focus:ring-2 focus:ring-amber-500/50"
                style={{ minHeight: 48 }}
              />
              {toGeo.query && (
                <button
                  onClick={() => {
                    toGeo.clear();
                    onDestinationChange(null);
                  }}
                  className="absolute right-3 top-[calc(50%+8px)] -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full text-zinc-500 active:text-zinc-300"
                >
                  ✕
                </button>
              )}
              {toGeo.showSuggestions && toGeo.suggestions.length > 0 && (
                <SuggestionList suggestions={toGeo.suggestions} onSelect={toGeo.select} />
              )}
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={() => {
              if (canSubmit) {
                onSubmit();
                setExpanded(false);
              }
            }}
            disabled={!canSubmit}
            className="mb-2 w-full rounded-xl bg-amber-500 py-4 text-base font-bold text-black transition-transform active:scale-[0.98] active:bg-amber-400 disabled:opacity-40 disabled:active:scale-100"
            style={{ minHeight: 52 }}
          >
            Let&apos;s Go
          </button>
        </div>
      )}
    </div>
  );
}

function SuggestionList({
  suggestions,
  onSelect,
}: {
  suggestions: Suggestion[];
  onSelect: (s: Suggestion) => void;
}) {
  return (
    <ul className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-xl bg-zinc-800 shadow-lg">
      {suggestions.map((s) => (
        <li key={s.id}>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onSelect(s)}
            className="w-full px-4 py-3 text-left text-sm text-zinc-200 active:bg-zinc-700"
            style={{ minHeight: 48 }}
          >
            {s.place_name}
          </button>
        </li>
      ))}
    </ul>
  );
}
