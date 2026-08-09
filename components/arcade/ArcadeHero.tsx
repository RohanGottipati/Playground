import type { GameSummary } from "@/lib/db/types";

export function ArcadeHero({ games }: { games: GameSummary[] }) {
  if (games.length === 0) return null;

  return (
    <div className="aspect-[16/9] w-full rounded-3xl border border-appleGray/30 bg-white sm:aspect-[21/9]" />
  );
}
