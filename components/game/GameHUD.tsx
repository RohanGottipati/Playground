"use client";

import type { HudState } from "@/game/bus";
import { formatMs } from "@/components/ui/formatters";

export function GameHUD({ hud, title }: { hud: HudState; title: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border-[3px] border-ink bg-cabinet px-4 py-2 font-mono text-xs uppercase text-paper shadow-stickerSm">
      <span className="truncate font-display text-sm text-token">{title}</span>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <span aria-label="elapsed time">⏱ {formatMs(hud.elapsedMs)}</span>
        <span aria-label="deaths">💀 {hud.deaths}</span>
        <span aria-label="collectibles">
          ◆ {hud.collectibles}/{hud.totalCollectibles}
        </span>
      </div>
    </div>
  );
}
