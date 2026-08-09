"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { DifficultyBadge, ModeBadge } from "@/components/ui/Badge";
import { modeMeta, tierFor } from "@/components/ui/difficulty";
import { formatMs, formatPercent } from "@/components/ui/formatters";
import { anonymousSessionId } from "@/lib/analytics/track";
import type { GameSummary } from "@/lib/db/types";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-paper/10 bg-ink/60 px-2 py-1.5">
      <dt className="font-mono text-[9px] uppercase tracking-wider text-paper/45">
        {label}
      </dt>
      <dd className="font-display text-sm text-paper/90">{value}</dd>
    </div>
  );
}

export function ArcadeCabinet({ game }: { game: GameSummary }) {
  const [likes, setLikes] = useState(game.likes);
  const [liking, setLiking] = useState(false);
  const tier = tierFor(game.difficulty);
  const mode = modeMeta(game.mode);

  async function like() {
    setLiking(true);
    try {
      const response = await fetch("/api/games/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId: game.id,
          anonymousSessionId: anonymousSessionId(),
        }),
      });
      if (response.ok) {
        const body = (await response.json()) as { likes: number };
        setLikes(body.likes);
      }
    } catch (error) {
      console.warn("like failed", error);
    } finally {
      setLiking(false);
    }
  }

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-2xl border-[3px] border-ink bg-cabinet shadow-sticker transition duration-200 hover:-translate-y-1 ${tier.glow}`}
    >
      {/* Cabinet marquee: mode-coloured light strip across the top. */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${mode.accent}`} />

      <Link
        href={`/game/${game.slug}`}
        className="relative block aspect-video overflow-hidden border-b-[3px] border-ink bg-black"
      >
        <Image
          src={game.sourceImageUrl}
          alt={`Objects used to build ${game.title}`}
          fill
          unoptimized
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition duration-300 group-hover:scale-[1.04]"
        />
        {/* CRT scanlines over the photo so cards read as arcade screens. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-25 mix-blend-overlay"
          style={{
            backgroundImage:
              "repeating-linear-gradient(180deg, rgba(0,0,0,0.5) 0 1px, transparent 1px 3px)",
          }}
        />
        <span className="absolute bottom-2 left-2 rounded bg-ink/85 px-2 py-1 font-mono text-[10px] uppercase text-screen">
          {game.detectedObjectCount} objects
        </span>
        <span className="absolute right-2 top-2">
          <ModeBadge mode={game.mode} />
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              href={`/game/${game.slug}`}
              className="font-display text-base uppercase leading-tight text-paper transition hover:text-token"
            >
              {game.title}
            </Link>
            <p className="truncate font-mono text-[11px] uppercase text-paper/55">
              by {game.creatorName}
              {game.parentGameId ? " · remix" : ""}
            </p>
          </div>
          <DifficultyBadge difficulty={game.difficulty} />
        </div>

        <dl className="grid grid-cols-3 gap-1.5">
          <Stat label="Plays" value={String(game.plays)} />
          <Stat label="Finish" value={formatPercent(game.completionRate)} />
          <Stat label="Best" value={formatMs(game.fastestMs)} />
        </dl>

        <div className="mt-auto flex items-center gap-2">
          <Link
            href={`/game/${game.slug}`}
            className="btn-primary flex-1 py-2 text-sm"
          >
            Play
          </Link>
          <button
            type="button"
            className="btn-secondary px-3 py-2 text-sm"
            aria-label={`Like ${game.title}`}
            disabled={liking}
            onClick={like}
          >
            ♥ {likes}
          </button>
        </div>
      </div>
    </article>
  );
}
