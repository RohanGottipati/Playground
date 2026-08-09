"use client";

import { useEffect, useMemo, useState } from "react";
import type { GameMode, GameRules } from "@/game/types";
import type { GameSummary, StatsSnapshot } from "@/lib/db/types";
import { getUserObjectsScannedCount } from "@/lib/analytics/objectsScanned";
import {
  SYNTHETIC_GAMES,
  SYNTHETIC_TOP_OBJECTS,
  syntheticDeathPoints,
  syntheticFatalityCount,
  syntheticRuntimeLeaderboard,
} from "@/lib/stats/syntheticSeed";
import { DeathHeatmap } from "./DeathHeatmap";
import { GameSelector } from "./GameSelector";
import { LiveTicker } from "./LiveTicker";
import { ActiveSessionsCard, FatalitiesCard, ObjectsScannedCard } from "./MetricCards";
import { ObjectTopology } from "./ObjectTopology";
import { RuntimeLeaderboard, type RuntimeLeaderboardRow } from "./RuntimeLeaderboard";
import type { DashboardEntity, DashboardWorld } from "./types";

// Comfortably readable for a live demo audience.
const POLL_MS = 2500;
const MAX_FATALITIES_DISPLAYED = 20;
const MAX_LEADERBOARD_ENTRIES = 10;

type RuntimeLeaderboardApiEntry = { city: string; durationSeconds: number };

type TelemetryResponse = {
  totalObjectsScannedGlobal: number;
  totalObjectsScannedUser: number;
  totalFatalitiesPerGame: Record<string, number>;
  activeSessionsByGame: Record<string, number>;
  recentEvents: string[];
  aggregateDeathsXY: { gameId: string; points: { x: number; y: number }[] }[];
  topObjects: { label: string; count: number }[];
  leaderboard: RuntimeLeaderboardApiEntry[];
};

function formatRuntimeSeconds(seconds: number): string {
  return `${seconds.toFixed(1)}s`;
}

type SelectedDetail = {
  title: string;
  detectedObjectCount: number;
  world: DashboardWorld;
  entities: DashboardEntity[];
  rules?: GameRules;
  mode?: GameMode;
};

type GameDetailApiResponse = {
  game: {
    title: string;
    detectedObjectCount: number;
    gameSpec: {
      world: DashboardWorld;
      entities: DashboardEntity[];
      rules?: GameRules;
      mode?: GameMode;
    };
  };
};

export function TechnationDashboard({
  initialStats,
  initialGames,
}: {
  initialStats: StatsSnapshot;
  initialGames: GameSummary[];
}) {
  const usingSyntheticGames = initialGames.length === 0;

  const gameOptions = useMemo(
    () =>
      usingSyntheticGames
        ? SYNTHETIC_GAMES.map((game) => ({ id: game.id, title: game.title }))
        : initialGames.map((game) => ({ id: game.id, title: game.title })),
    [usingSyntheticGames, initialGames],
  );

  const [selectedGameId, setSelectedGameId] = useState<string | null>(gameOptions[0]?.id ?? null);
  const [selectedDetail, setSelectedDetail] = useState<SelectedDetail | null>(null);
  const [telemetry, setTelemetry] = useState<TelemetryResponse | null>(null);
  const [yourTotal, setYourTotal] = useState(0);

  // Fetch (or synthesize) the selected game's spec: world bounds + entities
  // are only needed for the heatmap and per-game object breakdown.
  useEffect(() => {
    if (!selectedGameId) return;

    if (usingSyntheticGames) {
      const synthetic = SYNTHETIC_GAMES.find((game) => game.id === selectedGameId);
      if (synthetic) {
        setSelectedDetail({
          title: synthetic.title,
          detectedObjectCount: synthetic.detectedObjectCount,
          world: synthetic.world,
          entities: synthetic.entities,
        });
      }
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const response = await fetch(`/api/games/${selectedGameId}`);
        if (!response.ok) return;
        const body = (await response.json()) as GameDetailApiResponse;
        if (cancelled) return;
        setSelectedDetail({
          title: body.game.title,
          detectedObjectCount: body.game.detectedObjectCount,
          world: body.game.gameSpec.world,
          entities: body.game.gameSpec.entities,
          rules: body.game.gameSpec.rules,
          mode: body.game.gameSpec.mode,
        });
      } catch (error) {
        console.warn("game detail fetch failed", error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedGameId, usingSyntheticGames]);

  // Live telemetry poll driving every pillar: metrics, ticker, heatmap and
  // object topology all re-render off this one rolling snapshot, scoped to
  // the selected game, so the whole dashboard reacts as players start,
  // progress, die or clear a run on THAT game specifically. Switching games
  // clears the stale snapshot and refetches immediately. The ticker only
  // ever shows what this fetch actually returns — no fabricated entries.
  useEffect(() => {
    if (!selectedGameId) return;
    const gameId = selectedGameId;

    let cancelled = false;
    setTelemetry(null);

    async function poll() {
      setYourTotal(getUserObjectsScannedCount());
      try {
        const response = await fetch(
          `/api/events?userObjectsScanned=${getUserObjectsScannedCount()}&gameId=${encodeURIComponent(gameId)}`,
        );
        if (!response.ok) return;
        const body = (await response.json()) as TelemetryResponse;
        if (cancelled) return;
        setTelemetry(body);
      } catch (error) {
        console.warn("telemetry poll failed", error);
      }
    }

    void poll();
    const timer = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [selectedGameId]);

  const realFatalities: number = selectedGameId
    ? (telemetry?.totalFatalitiesPerGame[selectedGameId] ?? 0)
    : 0;

  const fatalitiesDisplay = Math.min(
    MAX_FATALITIES_DISPLAYED,
    realFatalities > 0 ? realFatalities : selectedGameId ? syntheticFatalityCount(selectedGameId) : 0,
  );

  const realPoints: { x: number; y: number }[] = selectedGameId
    ? (telemetry?.aggregateDeathsXY.find((entry) => entry.gameId === selectedGameId)?.points ?? [])
    : [];

  // The heatmap always plots exactly `fatalitiesDisplay` dots: real recorded
  // positions first, topped up with organic synthetic ones (seeded per game,
  // so they don't jitter between polls) whenever real samples run short.
  const basePoints = realPoints.slice(0, fatalitiesDisplay);
  const missingPoints = fatalitiesDisplay - basePoints.length;
  const fillerPoints =
    missingPoints > 0 && selectedGameId && selectedDetail
      ? syntheticDeathPoints(selectedGameId, selectedDetail.world, selectedDetail.entities, missingPoints)
      : [];
  const heatmapPoints = [...basePoints, ...fillerPoints];

  // Real only: no fabricated ticker entries, ever.
  const tickerLines = telemetry?.recentEvents ?? [];

  // Top 10 fastest completions for the selected game: real clears merged
  // with a stable per-game demo benchmark (1-10 ascending fallback times,
  // seeded off the game id so they don't jitter between polls), re-sorted
  // and re-ranked together so a real time slots in — or overtakes the
  // benchmark — wherever it actually falls, instead of always trailing it.
  const realRuntimeEntries: RuntimeLeaderboardApiEntry[] = telemetry?.leaderboard ?? [];
  const syntheticRuntimeEntries = selectedGameId ? syntheticRuntimeLeaderboard(selectedGameId) : [];
  const leaderboardEntries: RuntimeLeaderboardRow[] = [...realRuntimeEntries, ...syntheticRuntimeEntries]
    .sort((a, b) => a.durationSeconds - b.durationSeconds)
    .slice(0, MAX_LEADERBOARD_ENTRIES)
    .map((entry, index) => ({
      rank: index + 1,
      city: entry.city,
      time: formatRuntimeSeconds(entry.durationSeconds),
    }));

  const globalObjectsScanned =
    telemetry?.totalObjectsScannedGlobal && telemetry.totalObjectsScannedGlobal > 0
      ? telemetry.totalObjectsScannedGlobal
      : usingSyntheticGames
        ? SYNTHETIC_TOP_OBJECTS.reduce((sum, row) => sum + row.count, 0)
        : initialStats.objectsScanned;

  const activeSessionsDisplay: number = selectedGameId
    ? (telemetry?.activeSessionsByGame[selectedGameId] ?? 0)
    : 0;

  const globalTopObjects =
    telemetry?.topObjects && telemetry.topObjects.length > 0
      ? telemetry.topObjects
      : usingSyntheticGames
        ? SYNTHETIC_TOP_OBJECTS
        : initialStats.topObjects;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-3">
          <ObjectsScannedCard yourTotal={yourTotal} globalTotal={globalObjectsScanned} />
          <FatalitiesCard count={fatalitiesDisplay} gameTitle={selectedDetail?.title ?? "—"} />
          <ActiveSessionsCard
            count={activeSessionsDisplay}
            gameTitle={selectedDetail?.title ?? "—"}
          />
        </div>
      </div>

      <GameSelector games={gameOptions} selectedId={selectedGameId} onSelect={setSelectedGameId} />

      <div className="grid gap-4 lg:grid-cols-2">
        <LiveTicker events={tickerLines} />
        <RuntimeLeaderboard entries={leaderboardEntries} gameTitle={selectedDetail?.title ?? "—"} />
      </div>

      {selectedDetail ? (
        <DeathHeatmap
          world={selectedDetail.world}
          entities={selectedDetail.entities}
          points={heatmapPoints}
          gameTitle={selectedDetail.title}
          rules={selectedDetail.rules}
          mode={selectedDetail.mode}
        />
      ) : null}

      <ObjectTopology
        gameTitle={selectedDetail?.title ?? "—"}
        gameEntities={selectedDetail?.entities ?? []}
        globalTopObjects={globalTopObjects}
      />
    </div>
  );
}
