"use client";

import { useEffect, useMemo, useState } from "react";
import type { GameMode, GameRules } from "@/game/types";
import { getUserObjectsScannedCount } from "@/lib/analytics/objectsScanned";
import type {
  GameSummary,
  StatsSnapshot,
  TelemetrySnapshot,
} from "@/lib/db/types";
import { DeathHeatmap } from "./DeathHeatmap";
import { GameSelector } from "./GameSelector";
import { LiveTicker } from "./LiveTicker";
import {
  ActiveSessionsCard,
  FatalitiesCard,
  ObjectsScannedCard,
} from "./MetricCards";
import { ObjectTopology } from "./ObjectTopology";
import { RuntimeLeaderboard } from "./RuntimeLeaderboard";
import type { DashboardEntity, DashboardWorld } from "./types";

const POLL_MS = 2_500;

type SelectedDetail = {
  title: string;
  world: DashboardWorld;
  entities: DashboardEntity[];
  rules?: GameRules;
  mode?: GameMode;
};

type GameDetailApiResponse = {
  game: {
    title: string;
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
  const gameOptions = useMemo(
    () => initialGames.map((game) => ({ id: game.id, title: game.title })),
    [initialGames],
  );
  const [selectedGameId, setSelectedGameId] = useState<string | null>(
    gameOptions[0]?.id ?? null,
  );
  const [selectedDetail, setSelectedDetail] = useState<SelectedDetail | null>(null);
  const [telemetry, setTelemetry] = useState<TelemetrySnapshot | null>(null);
  const [yourTotal, setYourTotal] = useState(0);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    setYourTotal(getUserObjectsScannedCount());
  }, []);

  useEffect(() => {
    if (!selectedGameId) {
      setSelectedDetail(null);
      return;
    }

    let cancelled = false;
    setSelectedDetail(null);
    (async () => {
      try {
        const response = await fetch(`/api/games/${selectedGameId}`);
        if (!response.ok) throw new Error("game detail unavailable");
        const body = (await response.json()) as GameDetailApiResponse;
        if (cancelled) return;
        setSelectedDetail({
          title: body.game.title,
          world: body.game.gameSpec.world,
          entities: body.game.gameSpec.entities,
          rules: body.game.gameSpec.rules,
          mode: body.game.gameSpec.mode,
        });
      } catch (error) {
        if (!cancelled) {
          console.warn("game detail fetch failed", error);
          setStatus("Game details are temporarily unavailable.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedGameId]);

  useEffect(() => {
    if (!selectedGameId) {
      setTelemetry(null);
      return;
    }

    const gameId = selectedGameId;
    let cancelled = false;
    let inFlight = false;
    setTelemetry(null);
    setStatus(null);

    async function poll() {
      if (inFlight) return;
      inFlight = true;
      setYourTotal(getUserObjectsScannedCount());
      try {
        const response = await fetch(`/api/events?gameId=${encodeURIComponent(gameId)}`);
        if (!response.ok) throw new Error("telemetry unavailable");
        const body = (await response.json()) as TelemetrySnapshot;
        if (cancelled) return;
        setTelemetry(body);
        setStatus(null);
      } catch (error) {
        if (!cancelled) {
          console.warn("telemetry poll failed", error);
          setStatus("Live telemetry is temporarily unavailable.");
        }
      } finally {
        inFlight = false;
      }
    }

    void poll();
    const timer = window.setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [selectedGameId]);

  if (gameOptions.length === 0) {
    return (
      <div className="rounded-3xl bg-appleBg p-6 text-center">
        <p className="font-inter text-sm text-appleGray">
          No published games yet. Live telemetry will appear after the first game is published.
        </p>
      </div>
    );
  }

  const selectedTitle = selectedDetail?.title ?? "Loading game…";

  return (
    <div className="space-y-6">
      <GameSelector
        games={gameOptions}
        selectedId={selectedGameId}
        onSelect={setSelectedGameId}
      />

      {status ? (
        <p className="font-inter text-xs text-appleGray" role="status">
          {status}
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <ObjectsScannedCard
          yourTotal={yourTotal}
          globalTotal={initialStats.objectsScanned}
        />
        <FatalitiesCard
          count={telemetry?.fatalityCount ?? 0}
          gameTitle={selectedTitle}
        />
        <ActiveSessionsCard
          count={telemetry?.activeSessions ?? 0}
          gameTitle={selectedTitle}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <LiveTicker events={telemetry?.recentEvents ?? []} />
        <RuntimeLeaderboard
          entries={telemetry?.bestRuntimes ?? []}
          gameTitle={selectedTitle}
        />
      </div>

      {selectedDetail ? (
        <DeathHeatmap
          world={selectedDetail.world}
          entities={selectedDetail.entities}
          points={telemetry?.deathPoints ?? []}
          gameTitle={selectedDetail.title}
          rules={selectedDetail.rules}
          mode={selectedDetail.mode}
        />
      ) : (
        <div className="h-64 animate-pulse rounded-3xl bg-appleBg" aria-hidden />
      )}

      <ObjectTopology
        gameTitle={selectedTitle}
        gameEntities={selectedDetail?.entities ?? []}
        globalTopObjects={initialStats.topObjects}
      />
    </div>
  );
}
