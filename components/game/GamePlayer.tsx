"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import type { ControlState, GameBus, HudState, RunResult } from "@/game/bus";
import type { GameSpec } from "@/game/types";
import { startSession, track } from "@/lib/analytics/track";
import type { Leaderboard } from "@/lib/db/types";
import { GameHUD } from "./GameHUD";
import { GameResults } from "./GameResults";
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
  const [controls, setControls] = useState<ControlState | null>(null);
  const sessionRef = useRef<string | undefined>(undefined);
  const hudRef = useRef<HudState>(EMPTY_HUD);

  const onBus = useCallback(
    (bus: GameBus, controlState: ControlState) => {
      setControls(controlState);

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

  return (
    <div className="min-w-0 space-y-3">
      <GameHUD hud={hud} title={spec.title} />
      <PhaserCanvas spec={spec} onBus={onBus} />
      <TouchControls controls={controls} onRestart={restart} />

      <div className="flex flex-wrap items-center gap-3">
        <p className="hidden font-mono text-xs uppercase text-paper/60 md:block">
          A / D or arrows to move · W / space to jump · R to restart
        </p>
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
