"use client";

interface NeedToGoButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

export default function NeedToGoButton({ onPress, disabled = false }: NeedToGoButtonProps) {
  return (
    <button
      onClick={onPress}
      disabled={disabled}
      className="w-full rounded-2xl bg-amber-500 px-8 py-5 text-lg font-bold text-black shadow-lg shadow-amber-500/25 transition-transform active:scale-95 active:bg-amber-400 disabled:opacity-30 disabled:shadow-none disabled:active:scale-100"
      style={{ minHeight: 56 }}
    >
      I Need To Go
    </button>
  );
}
