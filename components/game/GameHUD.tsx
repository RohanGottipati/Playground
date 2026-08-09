"use client";

import type { HudState } from "@/game/bus";
import { formatMs } from "@/components/ui/formatters";
import { ModeBadge } from "@/components/ui/Badge";

export function GameHUD({
  hud,
  title,
  mode,
}: {
  hud: HudState;
  title: string;
  mode?: string;
}) {
  const rushCritical = (hud.timeLeftMs ?? Infinity) < 10_000;
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border-[3px] border-ink bg-cabinet px-4 py-2 font-mono text-xs uppercase text-paper shadow-stickerSm">
      <div className="flex min-w-0 items-center gap-2">
        <span className="truncate font-display text-sm text-token">{title}</span>
        {mode && mode !== "classic" ? <ModeBadge mode={mode} /> : null}
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <span aria-label="elapsed time">⏱ {formatMs(hud.elapsedMs)}</span>
        <span aria-label="deaths">💀 {hud.deaths}</span>
        <span aria-label="collectibles">
          ◆ {hud.collectibles}/{hud.totalCollectibles}
        </span>
        {hud.totalTargets ? (
          <span aria-label="targets remaining">
            🎯 {(hud.totalTargets ?? 0) - (hud.targetsLeft ?? 0)}/{hud.totalTargets}
          </span>
        ) : null}
        {hud.timeLeftMs !== undefined ? (
          <span
            aria-label="time remaining"
            className={rushCritical ? "animate-pulse text-marquee" : undefined}
          >
            ⏳ {formatMs(Math.max(0, hud.timeLeftMs))}
          </span>
        ) : null}
        {hud.goalLocked ? <span aria-label="goal locked">🔒</span> : null}
      </div>
    </div>
  );
}
