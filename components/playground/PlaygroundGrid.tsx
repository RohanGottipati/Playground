"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { tierFor } from "@/components/ui/difficulty";
import type { ArcadeSort, GameSummary } from "@/lib/db/types";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { PlaygroundCabinet } from "./PlaygroundCabinet";

const SORTS: { id: ArcadeSort; label: string }[] = [
  { id: "campaign", label: "Campaign" },
  { id: "newest", label: "Newest" },
  { id: "trending", label: "Trending" },
  { id: "hardest", label: "Hardest" },
  { id: "fastest", label: "Fastest clears" },
  { id: "most_remixed", label: "Most remixed" },
];

const PAGE_SIZE = 24;

function SkeletonCard() {
  return (
    <div className="h-[340px] animate-pulse rounded-2xl border-[3px] border-ink bg-cabinet/70">
      <div className="aspect-video rounded-t-xl bg-paper/5" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-2/3 rounded bg-paper/10" />
        <div className="h-3 w-1/3 rounded bg-paper/10" />
        <div className="h-10 rounded bg-paper/5" />
      </div>
    </div>
  );
}

/** Heading that separates one difficulty tier from the next as you scroll. */
function TierDivider({ difficulty }: { difficulty: number }) {
  const tier = tierFor(difficulty);
  return (
    <div className="col-span-full flex items-center gap-4 pt-2">
      <div className="flex items-baseline gap-3">
        <span
          className={`font-inter font-medium uppercase ${tier.text}`}
          style={{ fontSize: 20, letterSpacing: "-0.03em" }}
        >
          {tier.sectionTitle}
        </span>
        <span className="font-mono text-[11px] uppercase tracking-wider text-paper/45">
          {"★".repeat(tier.level)}
        </span>
      </div>
      <p
        className="hidden font-inter text-xs text-paper/50 sm:block"
        style={{ letterSpacing: "-0.01em" }}
      >
        {tier.blurb}
      </p>
      <div
        className={`h-[3px] flex-1 rounded-full bg-gradient-to-r ${tier.rail}`}
      />
    </div>
  );
}

export function PlaygroundGrid({ initialGames }: { initialGames: GameSummary[] }) {
  const [sort, setSort] = useState<ArcadeSort>("campaign");
  const [games, setGames] = useState<GameSummary[]>(initialGames);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialGames.length >= PAGE_SIZE);

  const load = useCallback(
    async (nextSort: ArcadeSort, offset: number) => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/games?sort=${nextSort}&limit=${PAGE_SIZE}&offset=${offset}`,
        );
        if (!response.ok) return;
        const body = (await response.json()) as { games: GameSummary[] };
        setGames((current) =>
          offset === 0 ? body.games : [...current, ...body.games],
        );
        setHasMore(body.games.length === PAGE_SIZE);
      } catch (error) {
        console.warn("playground fetch failed", error);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    const client = supabaseBrowser();
    if (!client) return;
    const channel = client
      .channel("playground-games")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "games" },
        () => void load(sort, 0),
      )
      .subscribe();
    return () => {
      void client.removeChannel(channel);
    };
  }, [load, sort]);

  const campaign = sort === "campaign";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Sort games">
        {SORTS.map((option) => (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={sort === option.id}
            className={`rounded-full px-4 py-2 font-inter text-xs font-medium transition ${
              sort === option.id
                ? "bg-appleInk text-white"
                : "bg-appleBg text-appleInk hover:bg-appleBg/70"
            }`}
            style={{ letterSpacing: "-0.01em" }}
            onClick={() => {
              setSort(option.id);
              void load(option.id, 0);
            }}
          >
            {option.label}
          </button>
        ))}
      </div>

      {games.length === 0 ? (
        <div className="space-y-3 rounded-2xl bg-appleBg p-5 text-center">
          <p className="font-inter text-appleGray" style={{ letterSpacing: "-0.01em" }}>
            The playground is empty. Be the first to turn a pile of objects into a game.
          </p>
          <Link
            href="/create"
            className="inline-flex rounded-full bg-appleInk px-5 py-2.5 font-inter text-sm font-medium text-white transition hover:bg-black"
            style={{ letterSpacing: "-0.02em" }}
          >
            Make the first game
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((game, index) => (
            <div key={game.id} className="contents">
              {campaign && game.difficulty !== games[index - 1]?.difficulty ? (
                <TierDivider difficulty={game.difficulty} />
              ) : null}
              <PlaygroundCabinet game={game} />
            </div>
          ))}
          {loading && games.length === 0
            ? Array.from({ length: 6 }, (_, index) => (
                <SkeletonCard key={`skeleton-${index}`} />
              ))
            : null}
        </div>
      )}

      {hasMore ? (
        <div className="text-center">
          <button
            type="button"
            className="rounded-full border border-appleGray/30 px-5 py-2.5 font-inter text-sm font-medium text-appleInk transition hover:border-appleGray/60 disabled:cursor-not-allowed disabled:opacity-60"
            style={{ letterSpacing: "-0.02em" }}
            disabled={loading}
            onClick={() => void load(sort, games.length)}
          >
            {loading ? "Loading…" : "Load more"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
