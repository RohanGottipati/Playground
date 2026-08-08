"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { ArcadeSort, GameSummary } from "@/lib/db/types";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { ArcadeCabinet } from "./ArcadeCabinet";

const SORTS: { id: ArcadeSort; label: string }[] = [
  { id: "newest", label: "Newest" },
  { id: "trending", label: "Trending" },
  { id: "hardest", label: "Hardest" },
  { id: "fastest", label: "Fastest clears" },
  { id: "most_remixed", label: "Most remixed" },
];

const PAGE_SIZE = 12;

export function ArcadeGrid({ initialGames }: { initialGames: GameSummary[] }) {
  const [sort, setSort] = useState<ArcadeSort>("newest");
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
        console.warn("arcade fetch failed", error);
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
      .channel("arcade-games")
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Sort games">
        {SORTS.map((option) => (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={sort === option.id}
            className={sort === option.id ? "btn-primary py-2 text-xs" : "btn-ghost py-2 text-xs"}
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
        <div className="panel space-y-3 text-center">
          <p className="font-body text-paper/80">
            The arcade is empty. Be the first to turn a pile of objects into a game.
          </p>
          <Link href="/create" className="btn-primary">
            Make the first game
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <ArcadeCabinet key={game.id} game={game} />
          ))}
        </div>
      )}

      {hasMore ? (
        <div className="text-center">
          <button
            type="button"
            className="btn-secondary"
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
