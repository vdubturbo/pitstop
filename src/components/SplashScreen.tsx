"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [phase, setPhase] = useState<"spin-in" | "hold" | "spin-out" | "done">("spin-in");

  useEffect(() => {
    // spin-in: 1040ms, hold: 780ms, spin-out: 780ms
    const t1 = setTimeout(() => setPhase("hold"), 1040);
    const t2 = setTimeout(() => setPhase("spin-out"), 1820);
    const t3 = setTimeout(() => {
      setPhase("done");
      onComplete();
    }, 2600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  if (phase === "done") return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-zinc-950">
      <Image
        src="/pitstop.png"
        alt="Pitstop"
        width={200}
        height={200}
        priority
        className={`
          ${phase === "spin-in" ? "animate-splash-in" : ""}
          ${phase === "hold" ? "scale-100 opacity-100" : ""}
          ${phase === "spin-out" ? "animate-splash-out" : ""}
        `}
      />
    </div>
  );
}
