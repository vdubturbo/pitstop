"use client";

import type { BathroomResult } from "@/types";

interface ResultsDrawerProps {
  results: BathroomResult[];
  isSearching: boolean;
  error: string | null;
  selectedResult: BathroomResult | null;
  onSelectResult: (result: BathroomResult | null) => void;
  onClose: () => void;
}

export default function ResultsDrawer({
  results,
  isSearching,
  error,
  selectedResult,
  onSelectResult,
  onClose,
}: ResultsDrawerProps) {
  return (
    <div
      className="max-h-[55dvh] rounded-t-2xl bg-zinc-900 shadow-2xl"
      style={{ paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom, 0px))" }}
    >
      {/* Drag handle */}
      <div className="flex justify-center pt-3 pb-2">
        <div className="h-1 w-10 rounded-full bg-zinc-700" />
      </div>

      {/* Header */}
      <div className="mb-3 flex items-center justify-between px-5">
        <h2 className="text-lg font-semibold text-zinc-100">
          {isSearching ? "Searching..." : `${results.length} Stop${results.length !== 1 ? "s" : ""} Found`}
        </h2>
        <button
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 active:bg-zinc-700"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="overflow-y-auto px-5" style={{ maxHeight: "calc(55dvh - 80px)" }}>
        {/* Loading state */}
        {isSearching && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse rounded-xl bg-zinc-800 p-4" style={{ minHeight: 80 }}>
                <div className="mb-2 h-4 w-3/4 rounded bg-zinc-700" />
                <div className="mb-1 h-3 w-1/2 rounded bg-zinc-700/60" />
                <div className="h-3 w-1/3 rounded bg-zinc-700/40" />
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {error && !isSearching && (
          <div className="rounded-xl bg-red-500/10 p-4 text-center">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!isSearching && !error && results.length === 0 && (
          <div className="rounded-xl bg-zinc-800 p-6 text-center">
            <p className="text-sm text-zinc-400">
              No stops found within 10 minutes of your route. Try again further along.
            </p>
          </div>
        )}

        {/* Results */}
        {!isSearching && results.length > 0 && (
          <div className="space-y-2.5 pb-2">
            {results.map((result, i) => {
              const isSelected =
                selectedResult?.coordinates[0] === result.coordinates[0] &&
                selectedResult?.coordinates[1] === result.coordinates[1];

              return (
                <button
                  key={`${result.name}-${i}`}
                  onClick={() => onSelectResult(isSelected ? null : result)}
                  className={`w-full rounded-xl p-4 text-left transition-colors ${
                    isSelected
                      ? "bg-amber-500/15 ring-1 ring-amber-500/40"
                      : "bg-zinc-800 active:bg-zinc-750"
                  }`}
                  style={{ minHeight: 72 }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-base font-medium text-zinc-100">
                        {result.name}
                      </p>
                      {result.brand && result.brand !== result.name && (
                        <p className="text-sm text-zinc-500">{result.brand}</p>
                      )}
                      <p className="mt-1 text-sm text-zinc-400">
                        {result.milesAhead.toFixed(1)} mi ahead
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span className="whitespace-nowrap rounded-lg bg-amber-500/20 px-2.5 py-1 text-sm font-bold text-amber-400">
                        {result.detourMinutes < 1
                          ? "<1 min"
                          : `${Math.round(result.detourMinutes)} min`}{" "}
                        detour
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log("Navigate to:", result.coordinates);
                        }}
                        className="rounded-lg bg-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-200 active:bg-zinc-600"
                        style={{ minHeight: 32 }}
                      >
                        Navigate
                      </button>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
