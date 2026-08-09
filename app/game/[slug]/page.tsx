import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GamePageClient } from "@/components/game/GamePageClient";
import { LeaderboardPanel } from "@/components/game/LeaderboardPanel";
import { DifficultyBadge, ModeBadge } from "@/components/ui/Badge";
import { repository } from "@/lib/db";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const game = await repository().getGameBySlug(slug);
  if (!game) return { title: "Game not found — Playground" };

  return {
    title: `${game.title} — Playground`,
    description: `A platformer generated from ${game.detectedObjectCount} real objects photographed by ${game.creatorName}.`,
    openGraph: {
      title: game.title,
      description: `Play a level built from real objects. Difficulty ${game.difficulty}/5.`,
      images: [{ url: game.sourceImageUrl }],
    },
  };
}

export default async function GamePage({ params }: Props) {
  const { slug } = await params;
  const db = repository();
  const game = await db.getGameBySlug(slug);
  if (!game || game.status !== "published") notFound();

  const leaderboard = await db.getLeaderboard(game.id);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="marquee-title text-3xl text-token">{game.title}</h1>
          <p className="font-mono text-xs uppercase text-paper/60">
            by {game.creatorName} · {game.detectedObjectCount} objects ·{" "}
            {game.theme} theme
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ModeBadge mode={game.gameSpec.mode ?? "classic"} />
          <DifficultyBadge difficulty={game.difficulty} />
          <Link href="/arcade" className="btn-ghost px-3 py-2 text-xs">
            Back to arcade
          </Link>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <GamePageClient
          gameId={game.id}
          slug={slug}
          spec={game.gameSpec}
          sourceImageUrl={game.sourceImageUrl}
          detectedObjectCount={game.detectedObjectCount}
        />
        <div className="space-y-6">
          <LeaderboardPanel leaderboard={leaderboard} />
          <div className="panel">
            <h2 className="marquee-title mb-3 text-lg text-token">
              Objects in this level
            </h2>
            <ul className="space-y-1 font-mono text-xs text-paper/80">
              {game.gameSpec.entities
                .filter((entity) => entity.sourceLabel)
                .map((entity) => (
                  <li key={entity.id}>
                    {entity.sourceLabel} → {entity.mechanic.replace(/_/g, " ")}
                  </li>
                ))}
            </ul>
          </div>
          <Link href={`/create?remixOf=${game.id}`} className="btn-secondary w-full">
            Remix with your own objects
          </Link>
        </div>
      </div>
    </div>
  );
}
