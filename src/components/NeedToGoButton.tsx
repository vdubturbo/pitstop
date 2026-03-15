"use client";

interface NeedToGoButtonProps {
  onPress: () => void;
}

export default function NeedToGoButton({ onPress }: NeedToGoButtonProps) {
  return (
    <button
      onClick={onPress}
      className="w-full rounded-2xl bg-amber-500 px-8 py-5 text-lg font-bold text-black shadow-lg shadow-amber-500/25 active:scale-95 active:bg-amber-400 transition-transform"
      style={{ minHeight: 56 }}
    >
      I Need To Go
    </button>
  );
}
