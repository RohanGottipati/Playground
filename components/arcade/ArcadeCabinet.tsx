"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { formatMs, formatPercent } from "@/components/ui/formatters";
import { anonymousSessionId } from "@/lib/analytics/track";
import type { GameSummary } from "@/lib/db/types";

const MODE_LABELS: Record<string, string> = {
  classic: "Platformer",
  shooter: "Shooter",
  skyfall: "Skyfall",
  rush: "Rush",
};

const DIFFICULTY_LABELS = ["Gentle", "Easy", "Tricky", "Hard", "Brutal"];

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

  const difficultyLabel =
    DIFFICULTY_LABELS[Math.min(4, Math.max(0, game.difficulty - 1))];

  return (
    <article className="flex flex-col gap-3 rounded-2xl bg-appleBg p-4 transition hover:shadow-lg hover:shadow-black/5">
      <Link
        href={`/game/${game.slug}`}
        className="relative aspect-video overflow-hidden rounded-xl bg-black"
      >
        <Image
          src={game.sourceImageUrl}
          alt={`Objects used to build ${game.title}`}
          fill
          unoptimized
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
        />
        <span className="absolute bottom-2 left-2 rounded-full bg-black/60 px-2 py-1 font-body text-[10px] font-medium text-white backdrop-blur-sm">
          {game.detectedObjectCount} objects
        </span>
      </Link>

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link
            href={`/game/${game.slug}`}
            className="truncate font-body text-base font-semibold text-appleInk hover:text-appleBlue"
          >
            {game.title}
          </Link>
          <p className="truncate font-body text-xs text-appleGray">
            {game.creatorName}
            {game.parentGameId ? " · remix" : ""}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1 font-body text-[11px] font-medium text-appleGray">
          <span>{difficultyLabel}</span>
          <span>{MODE_LABELS[game.mode] ?? "Platformer"}</span>
        </div>
      </div>

      <dl className="grid grid-cols-3 gap-2 font-body text-[11px] text-appleGray">
        <div>
          <dt className="text-appleGray/70">Plays</dt>
          <dd className="font-semibold text-appleInk">{game.plays}</dd>
        </div>
        <div>
          <dt className="text-appleGray/70">Finish</dt>
          <dd className="font-semibold text-appleInk">
            {formatPercent(game.completionRate)}
          </dd>
        </div>
        <div>
          <dt className="text-appleGray/70">Best</dt>
          <dd className="font-semibold text-appleInk">
            {formatMs(game.fastestMs)}
          </dd>
        </div>
      </dl>

      <div className="flex items-center justify-between gap-2">
        <Link
          href={`/game/${game.slug}`}
          className="flex-1 rounded-full bg-appleInk py-2 text-center font-body text-sm font-semibold text-white transition hover:bg-black"
        >
          Play
        </Link>
        <button
          type="button"
          className="rounded-full border border-appleGray/30 px-3 py-2 font-body text-sm font-medium text-appleInk transition hover:border-appleGray/60 disabled:cursor-not-allowed disabled:opacity-60"
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
