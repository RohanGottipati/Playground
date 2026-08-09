import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GamePageClient } from "@/components/game/GamePageClient";
import { LeaderboardPanel } from "@/components/game/LeaderboardPanel";
import { modeMeta, tierFor } from "@/components/ui/difficulty";
import { spriteUrl } from "@/components/ui/spriteUrl";
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

/** The photographed props, shown with the very art the level renders. */
function ObjectsPanel({ spec }: { spec: GameSpec }) {
  // A level reuses the same prop for many slots, so count them rather than
  // printing "lollipop" ten times.
  const props = new Map<
    string,
    { label: string; mechanic: string; componentId?: string; count: number }
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
      label: entity.sourceLabel,
      mechanic: entity.mechanic,
      componentId: entity.visual?.componentId,
      count: 1,
    });
  }
  if (props.size === 0) return null;

  return (
    <div className="rounded-2xl bg-appleBg p-5">
      <h2
        className="mb-3 font-inter font-medium text-appleInk"
        style={{ fontSize: 15, letterSpacing: "-0.02em" }}
      >
        Objects in this level
      </h2>
      <ul className="grid grid-cols-2 gap-2">
        {[...props.entries()].map(([key, entity]) => {
          const art = spriteUrl(entity.componentId);
          return (
            <li
              key={key}
              className="flex items-center gap-2 rounded-xl bg-white px-2 py-1.5"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-appleBg">
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
                <span
                  className="block truncate font-inter font-medium text-appleInk"
                  style={{ fontSize: 12, letterSpacing: "-0.01em" }}
                >
                  {entity.label}
                  {entity.count > 1 ? (
                    <span className="text-appleGray"> ×{entity.count}</span>
                  ) : null}
                </span>
                <span
                  className="block truncate font-inter text-appleGray"
                  style={{ fontSize: 11, letterSpacing: "-0.01em" }}
                >
                  {entity.mechanic.replace(/_/g, " ")}
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
    <>
      <div className="fixed inset-0 -z-10 bg-white" />
      <div className="space-y-8">
        <header className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="font-inter text-sm font-medium uppercase tracking-wide text-appleGray">
                Playground
              </p>
              <h1
                className="font-inter font-medium text-appleInk"
                style={{ fontSize: 30, letterSpacing: "-0.04em" }}
              >
                {game.title}
              </h1>
              <p
                className="font-inter text-sm text-appleGray"
                style={{ letterSpacing: "-0.01em" }}
              >
                by {game.creatorName} · {game.detectedObjectCount} objects ·{" "}
                {game.theme} theme
                {position >= 0
                  ? ` · campaign ${position + 1} of ${campaign.length}`
                  : ""}
              </p>
            </div>
            <Link
              href="/playground"
              className="shrink-0 rounded-full border border-appleGray/30 px-4 py-2 font-inter text-sm font-medium text-appleInk transition hover:border-appleGray/60"
              style={{ letterSpacing: "-0.02em" }}
            >
              Back to Playground
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 rounded-full bg-appleBg px-3 py-1.5 font-inter text-xs font-medium text-appleInk"
              style={{ letterSpacing: "-0.01em" }}
            >
              <span aria-hidden>{mode.icon}</span> {mode.label}
            </span>
            <span
              className="inline-flex items-center gap-1.5 rounded-full bg-appleBg px-3 py-1.5 font-inter text-xs font-medium text-appleInk"
              style={{ letterSpacing: "-0.01em" }}
            >
              Difficulty {tier.level}/5 · {tier.label}
            </span>
          </div>

          {spec.rules ? (
            <div className="rounded-2xl bg-appleBg p-4">
              <p
                className="font-inter font-medium text-appleInk"
                style={{ fontSize: 14, letterSpacing: "-0.02em" }}
              >
                {spec.rules.headline}
              </p>
              <p
                className="font-inter text-appleGray"
                style={{ fontSize: 13, letterSpacing: "-0.01em" }}
              >
                {spec.rules.objective}
              </p>
            </div>
          ) : null}
        </header>

        <div className="space-y-6">
          <GamePageClient
            gameId={game.id}
            slug={slug}
            spec={spec}
            sourceImageUrl={game.sourceImageUrl}
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <LeaderboardPanel leaderboard={leaderboard} />
            <ObjectsPanel spec={spec} />
            <Link
              href={`/create?remixOf=${game.id}`}
              className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-appleInk p-5 text-center transition hover:bg-black"
            >
              <span
                className="font-inter font-medium text-white"
                style={{ fontSize: 15, letterSpacing: "-0.02em" }}
              >
                Remix with your own objects
              </span>
              <span
                className="font-inter text-white/60"
                style={{ fontSize: 12, letterSpacing: "-0.01em" }}
              >
                Start a new level from this one
              </span>
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
                className="flex-1 rounded-2xl bg-appleBg p-4 transition hover:bg-appleBg/70"
              >
                <span
                  className="block font-inter text-xs font-medium uppercase tracking-wide text-appleGray"
                  style={{ letterSpacing: "-0.01em" }}
                >
                  ← Easier
                </span>
                <span
                  className="block truncate font-inter font-medium text-appleInk"
                  style={{ fontSize: 14, letterSpacing: "-0.02em" }}
                >
                  {previous.title}
                </span>
              </Link>
            ) : null}
            {next ? (
              <Link
                href={`/game/${next.slug}`}
                className="flex-1 rounded-2xl bg-appleBg p-4 text-right transition hover:bg-appleBg/70"
              >
                <span
                  className="block font-inter text-xs font-medium uppercase tracking-wide text-appleGray"
                  style={{ letterSpacing: "-0.01em" }}
                >
                  Harder →
                </span>
                <span
                  className="block truncate font-inter font-medium text-appleInk"
                  style={{ fontSize: 14, letterSpacing: "-0.02em" }}
                >
                  {next.title}
                </span>
              </Link>
            ) : null}
          </nav>
        ) : null}
      </div>
    </>
  );
}
