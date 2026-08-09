import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GamePageClient } from "@/components/game/GamePageClient";
import { LeaderboardPanel } from "@/components/game/LeaderboardPanel";
import { DifficultyBadge, ModeBadge } from "@/components/ui/Badge";
import { modeMeta, tierFor } from "@/components/ui/difficulty";
import { spriteUrl } from "@/components/ui/spriteUrl";
import { ShareButton } from "@/components/ui/ShareButton";
import { repository } from "@/lib/db";

import type { GameSpec } from "@/game/types";

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

/**
 * The photographed props, shown with the very art the level renders. Grouped
 * by source object internally so repeats collapse into one tile with a
 * count, but the object's detected name never reaches this panel — only its
 * art and its generic gameplay role are user-facing.
 */
function ObjectsPanel({ spec }: { spec: GameSpec }) {
  const props = new Map<
    string,
    { mechanic: string; componentId?: string; count: number }
  >();
  for (const entity of spec.entities) {
    if (!entity.sourceLabel) continue;
    const key = `${entity.sourceLabel}:${entity.mechanic}`;
    const existing = props.get(key);
    if (existing) {
      existing.count += 1;
      continue;
    }
    props.set(key, {
      mechanic: entity.mechanic,
      componentId: entity.visual?.componentId,
      count: 1,
    });
  }
  if (props.size === 0) return null;

  return (
    <div className="panel">
      <h2 className="marquee-title mb-3 text-lg text-token">
        Objects in this level
      </h2>
      <ul className="grid grid-cols-2 gap-2">
        {[...props.entries()].map(([key, entity]) => {
          const art = spriteUrl(entity.componentId);
          return (
            <li
              key={key}
              className="flex items-center gap-2 rounded-lg border border-paper/10 bg-ink/50 px-2 py-1.5"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-paper/10">
                {art ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={art}
                    alt=""
                    aria-hidden
                    className="h-6 w-6 object-contain"
                  />
                ) : null}
              </span>
              <span className="min-w-0">
                <span className="block truncate font-mono text-[11px] text-paper/90">
                  {entity.mechanic.replace(/_/g, " ")}
                  {entity.count > 1 ? (
                    <span className="text-paper/45"> ×{entity.count}</span>
                  ) : null}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default async function GamePage({ params }: Props) {
  const { slug } = await params;
  const db = repository();
  const game = await db.getGameBySlug(slug);
  if (!game || game.status !== "published") notFound();

  const [leaderboard, campaign] = await Promise.all([
    db.getLeaderboard(game.id),
    db.listGames({ sort: "campaign", limit: 48, offset: 0 }),
  ]);

  const position = campaign.findIndex((entry) => entry.id === game.id);
  const previous = position > 0 ? campaign[position - 1] : undefined;
  const next = position >= 0 ? campaign[position + 1] : undefined;

  const spec = game.gameSpec;
  const mode = modeMeta(spec.mode ?? "classic");
  const tier = tierFor(game.difficulty);

  return (
    <div className="space-y-6">
      <header className="overflow-hidden rounded-2xl border-[3px] border-ink bg-cabinet shadow-sticker">
        <div className={`h-1.5 w-full bg-gradient-to-r ${mode.accent}`} />
        <div className="flex flex-wrap items-end justify-between gap-3 p-5">
          <div className="space-y-1">
            <h1 className="marquee-title text-3xl text-token">{game.title}</h1>
            <p className="font-mono text-xs uppercase text-paper/60">
              by {game.creatorName} · {game.detectedObjectCount} objects ·{" "}
              {game.theme} theme
              {position >= 0
                ? ` · campaign ${position + 1} of ${campaign.length}`
                : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ModeBadge mode={spec.mode ?? "classic"} />
            <DifficultyBadge difficulty={game.difficulty} size="lg" />
            <ShareButton slug={slug} />
            <Link href="/arcade" className="btn-ghost px-3 py-2 text-xs">
              Back to arcade
            </Link>
          </div>
        </div>
        {spec.rules ? (
          <div
            className={`border-t-[3px] border-ink bg-ink/40 px-5 py-3 ${tier.text}`}
          >
            <p className="font-display text-sm uppercase">
              {spec.rules.headline}
            </p>
            <p className="font-body text-sm text-paper/70">
              {spec.rules.objective}
            </p>
          </div>
        ) : null}
      </header>

      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <GamePageClient
          gameId={game.id}
          slug={slug}
          spec={spec}
          sourceImageUrl={game.sourceImageUrl}
          detectedObjectCount={game.detectedObjectCount}
        />
        <div className="space-y-6">
          <LeaderboardPanel leaderboard={leaderboard} />
          <ObjectsPanel spec={spec} />
          <Link
            href={`/create?remixOf=${game.id}`}
            className="btn-secondary w-full"
          >
            Remix with your own objects
          </Link>
        </div>
      </div>

      {previous || next ? (
        <nav
          aria-label="Campaign navigation"
          className="flex flex-wrap items-stretch justify-between gap-3"
        >
          {previous ? (
            <Link
              href={`/game/${previous.slug}`}
              className="panel flex-1 transition hover:-translate-y-0.5"
            >
              <span className="font-mono text-[10px] uppercase tracking-wider text-paper/45">
                ← Easier
              </span>
              <span className="block font-display text-sm uppercase text-paper">
                {previous.title}
              </span>
            </Link>
          ) : null}
          {next ? (
            <Link
              href={`/game/${next.slug}`}
              className="panel flex-1 text-right transition hover:-translate-y-0.5"
            >
              <span className="font-mono text-[10px] uppercase tracking-wider text-paper/45">
                Harder →
              </span>
              <span className="block font-display text-sm uppercase text-paper">
                {next.title}
              </span>
            </Link>
          ) : null}
        </nav>
      ) : null}
    </div>
  );
}
