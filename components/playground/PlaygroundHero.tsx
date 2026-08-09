"use client";

import type { GameSummary } from "@/lib/db/types";

export function PlaygroundHero({ games }: { games: GameSummary[] }) {
  if (games.length === 0) return null;

  return (
    <div className="aspect-[16/9] w-full overflow-hidden rounded-3xl border border-appleGray/30 bg-[#f2eeee] sm:aspect-[21/9]">
      <video
        className="h-full w-full object-cover"
        src="/video/playground-hero.mov"
        autoPlay
        muted
        playsInline
        preload="auto"
      />
    </div>
  );
}
