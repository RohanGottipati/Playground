"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { DifficultyBadge } from "@/components/ui/Badge";
import { formatMs, formatPercent } from "@/components/ui/formatters";
import { anonymousSessionId } from "@/lib/analytics/track";
import type { GameSummary } from "@/lib/db/types";

export function ArcadeCabinet({ game }: { game: GameSummary }) {
  const [likes, setLikes] = useState(game.likes);
  const [liking, setLiking] = useState(false);

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
    <article className="flex flex-col gap-3 rounded-2xl border-[3px] border-ink bg-cabinet p-4 shadow-sticker">
      <Link
        href={`/game/${game.slug}`}
        className="relative aspect-video overflow-hidden rounded-xl border-2 border-ink bg-black"
      >
        <Image
          src={game.sourceImageUrl}
          alt={`Objects used to build ${game.title}`}
          fill
          unoptimized
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover opacity-90"
        />
        <span className="absolute bottom-2 left-2 rounded bg-ink/85 px-2 py-1 font-mono text-[10px] uppercase text-screen">
          {game.detectedObjectCount} objects
        </span>
      </Link>

      <div className="flex items-start justify-between gap-2">
        <div>
          <Link
            href={`/game/${game.slug}`}
            className="font-display text-base uppercase text-paper hover:text-token"
          >
            {game.title}
          </Link>
          <p className="font-mono text-[11px] uppercase text-paper/60">
            by {game.creatorName}
            {game.parentGameId ? " · remix" : ""}
          </p>
        </div>
        <DifficultyBadge difficulty={game.difficulty} />
      </div>

      <dl className="grid grid-cols-3 gap-2 font-mono text-[11px] uppercase text-paper/70">
        <div>
          <dt className="text-paper/50">Plays</dt>
          <dd>{game.plays}</dd>
        </div>
        <div>
          <dt className="text-paper/50">Finish</dt>
          <dd>{formatPercent(game.completionRate)}</dd>
        </div>
        <div>
          <dt className="text-paper/50">Best</dt>
          <dd>{formatMs(game.fastestMs)}</dd>
        </div>
      </dl>

      <div className="flex items-center justify-between gap-2">
        <Link href={`/game/${game.slug}`} className="btn-primary flex-1 py-2 text-sm">
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
    </article>
  );
}
