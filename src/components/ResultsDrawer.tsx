"use client";

interface ResultsDrawerProps {
  onClose: () => void;
}

export default function ResultsDrawer({ onClose }: ResultsDrawerProps) {
  return (
    <div className="max-h-[60dvh] rounded-t-2xl bg-zinc-900 px-5 pt-3 shadow-2xl" style={{ paddingBottom: "calc(2rem + env(safe-area-inset-bottom, 0px))" }}>
      {/* Drag handle */}
      <div className="mb-4 flex justify-center">
        <div className="h-1 w-10 rounded-full bg-zinc-700" />
      </div>

      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-100">Stops Along Your Route</h2>
        <button
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 active:bg-zinc-700"
        >
          ✕
        </button>
      </div>

      {/* Placeholder results */}
      <div className="space-y-3 overflow-y-auto">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-xl bg-zinc-800 p-4"
            style={{ minHeight: 72 }}
          >
            <div className="mb-1 h-4 w-3/4 rounded bg-zinc-700" />
            <div className="h-3 w-1/2 rounded bg-zinc-700/60" />
          </div>
        ))}
      </div>
    </div>
  );
}
