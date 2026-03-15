"use client";

interface RouteInputProps {
  onClose: () => void;
  onSearch: () => void;
}

export default function RouteInput({ onClose, onSearch }: RouteInputProps) {
  return (
    <div className="rounded-t-2xl bg-zinc-900 px-5 pt-3 shadow-2xl" style={{ paddingBottom: "calc(2rem + env(safe-area-inset-bottom, 0px))" }}>
      {/* Drag handle */}
      <div className="mb-4 flex justify-center">
        <div className="h-1 w-10 rounded-full bg-zinc-700" />
      </div>

      {/* Close button */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-100">Plan Your Route</h2>
        <button
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 active:bg-zinc-700"
        >
          ✕
        </button>
      </div>

      {/* Origin input */}
      <div className="mb-3">
        <label className="mb-1 block text-sm text-zinc-500">From</label>
        <input
          type="text"
          placeholder="Starting point or current location"
          className="w-full rounded-xl bg-zinc-800 px-4 py-3.5 text-base text-zinc-100 placeholder-zinc-600 outline-none focus:ring-2 focus:ring-amber-500/50"
          style={{ minHeight: 48 }}
        />
      </div>

      {/* Destination input */}
      <div className="mb-5">
        <label className="mb-1 block text-sm text-zinc-500">To</label>
        <input
          type="text"
          placeholder="Destination"
          className="w-full rounded-xl bg-zinc-800 px-4 py-3.5 text-base text-zinc-100 placeholder-zinc-600 outline-none focus:ring-2 focus:ring-amber-500/50"
          style={{ minHeight: 48 }}
        />
      </div>

      {/* Search button */}
      <button
        onClick={onSearch}
        className="w-full rounded-xl bg-amber-500 py-4 text-base font-bold text-black active:scale-[0.98] active:bg-amber-400 transition-transform"
        style={{ minHeight: 52 }}
      >
        Find Stops Along Route
      </button>
    </div>
  );
}
