"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import type { ControlState, GameBus, HudState, RunResult } from "@/game/bus";
import { fallbackRules } from "@/game/generation/rules";
import type { GameSpec } from "@/game/types";
import { startSession, track } from "@/lib/analytics/track";
import type { Leaderboard } from "@/lib/db/types";
import { GameHUD } from "./GameHUD";
import { GameResults } from "./GameResults";
import { GameRulesModal } from "./GameRulesModal";
import { PhaserCanvas } from "./PhaserCanvas";
import { TouchControls } from "./TouchControls";

type Props = {
  gameId: string;
  spec: GameSpec;
  sourceImageUrl?: string;
  shareUrl?: string;
  recordEvents?: boolean;
  onRemix?: () => void;
};

const EMPTY_HUD: HudState = {
  elapsedMs: 0,
  deaths: 0,
  collectibles: 0,
  totalCollectibles: 0,
};

/** The photographed object that best represents a level, for the rules card. */
function heroComponentId(spec: GameSpec): string | undefined {
  if (spec.gauntlet) {
    const turret = spec.entities.find(
      (entity) => entity.id === spec.gauntlet?.turretId,
    );
    if (turret?.visual?.componentId) return turret.visual.componentId;
  }
  return (
    spec.skyfall?.componentIds[0] ??
    spec.projectile?.componentId ??
    spec.entities.find((entity) => entity.sourceLabel && entity.visual?.componentId)
      ?.visual?.componentId
  );
}

export function GamePlayer({
  gameId,
  spec,
  sourceImageUrl,
  shareUrl,
  recordEvents = true,
  onRemix,
}: Props) {
  const [hud, setHud] = useState<HudState>(EMPTY_HUD);
  const [result, setResult] = useState<RunResult | null>(null);
  const [leaderboard, setLeaderboard] = useState<Leaderboard | null>(null);
  const [showPhoto, setShowPhoto] = useState(false);
  const [showRules, setShowRules] = useState(true);
  const [controls, setControls] = useState<ControlState | null>(null);
  const [engineReady, setEngineReady] = useState(false);
  const [engineError, setEngineError] = useState<string | null>(null);
  const sessionRef = useRef<string | undefined>(undefined);
  const hudRef = useRef<HudState>(EMPTY_HUD);

  const rules = spec.rules ?? fallbackRules(spec);
  const mode = spec.mode ?? "classic";

  const onBus = useCallback(
    (bus: GameBus, controlState: ControlState) => {
      setEngineReady(false);
      setEngineError(null);
      setControls(controlState);

      bus.on("ready", () => setEngineReady(true));
      bus.on("error", ({ message }) => {
        setEngineReady(false);
        setEngineError(message);
      });

      bus.on("hud", (next) => {
        hudRef.current = next;
        setHud(next);
      });

      bus.on("completed", async (runResult) => {
        setResult(runResult);
        if (!recordEvents) return;
        try {
          const response = await fetch(`/api/leaderboard/${gameId}`);
          if (response.ok) setLeaderboard((await response.json()) as Leaderboard);
        } catch (error) {
          console.warn("leaderboard fetch failed", error);
        }
      });

      bus.on("gameEvent", async (event) => {
        if (!recordEvents) return;
        if (event.type === "game_started" && !sessionRef.current) {
          sessionRef.current = await startSession(gameId);
        }
        if (event.type === "game_started" || event.type === "game_restarted") {
          setResult(null);
        }
        void track({
          gameId,
          sessionId: sessionRef.current,
          eventType: event.type,
          payload: event.payload,
          run: {
            elapsedMs: hudRef.current.elapsedMs,
            deaths: hudRef.current.deaths,
            collectibles: hudRef.current.collectibles,
          },
        });

      });
    },
    [gameId, recordEvents],
  );

  const restart = useCallback(() => {
    if (controls) controls.restart = true;
    setResult(null);
  }, [controls]);

  const startRun = useCallback(() => {
    if (!controls || !engineReady || engineError) return;
    controls.started = true;
    setShowRules(false);
  }, [controls, engineError, engineReady]);

  const reopenRules = useCallback(() => {
    // Pausing via the scene's start gate: physics and the timer idle while
    // started is false.
    if (controls) controls.started = false;
    setShowRules(true);
  }, [controls]);

  return (
    <div className="min-w-0 space-y-3">
      <GameHUD hud={hud} title={spec.title} mode={mode} />
      <div className="relative">
        <PhaserCanvas spec={spec} onBus={onBus} onError={setEngineError} />
        {engineError ? (
          <div
            className="absolute inset-0 z-20 flex items-center justify-center bg-ink/90 p-5"
            role="alert"
          >
            <div className="panel max-w-lg text-center text-sm text-paper">
              {engineError}
            </div>
          </div>
        ) : showRules ? (
          <GameRulesModal
            rules={rules}
            mode={mode}
            difficulty={spec.difficulty}
            heroComponentId={heroComponentId(spec)}
            ready={engineReady}
            onStart={startRun}
          />
        ) : null}
      </div>
      <TouchControls
        controls={controls}
        onRestart={restart}
        canShoot={spec.player.canShoot ?? false}
      />

      <div className="flex flex-wrap items-center gap-3">
        <p className="hidden font-mono text-xs uppercase text-paper/60 md:block">
          A / D or arrows to move · W / space to jump
          {spec.player.canShoot ? " · X / F to shoot" : ""} · R to restart
        </p>
        <button
          type="button"
          className="btn-ghost px-3 py-2 text-xs"
          onClick={reopenRules}
        >
          How to play
        </button>
        {sourceImageUrl ? (
          <button
            type="button"
            className="btn-ghost px-3 py-2 text-xs"
            aria-expanded={showPhoto}
            onClick={() => setShowPhoto((value) => !value)}
          >
            {showPhoto ? "Hide original photo" : "See the original photo"}
          </button>
        ) : null}
      </div>

      {showPhoto && sourceImageUrl ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl border-[3px] border-ink shadow-sticker">
          <Image
            src={sourceImageUrl}
            alt="The photo this level was generated from"
            fill
            unoptimized
            className="object-contain"
          />
        </div>
      ) : null}

      {result ? (
        <GameResults
          result={result}
          leaderboard={leaderboard}
          shareUrl={shareUrl}
          onRestart={restart}
          onRemix={onRemix}
        />
      ) : null}
    </div>
  );
}
