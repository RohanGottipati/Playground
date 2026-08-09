"use client";

import type { HudState } from "@/game/bus";
import { formatMs } from "@/components/ui/formatters";
import { ModeBadge } from "@/components/ui/Badge";

/** One instrument in the HUD cluster: a small label above a big value. */
function Gauge({
  label,
  value,
  tone,
  ariaLabel,
}: {
  label: string;
  value: string;
  tone?: string;
  ariaLabel: string;
}) {
  return (
    <div
      className="flex flex-col items-center rounded-lg border border-paper/10 bg-ink/60 px-2.5 py-1 leading-tight"
      aria-label={ariaLabel}
    >
      <span className="font-mono text-[8px] uppercase tracking-widest text-paper/40">
        {label}
      </span>
      <span className={`font-display text-sm ${tone ?? "text-paper"}`}>
        {value}
      </span>
    </div>
  );
}

/** Objective progress, so the win condition is always visible mid-run. */
function ProgressGauge({
  label,
  current,
  total,
  tone,
  bar,
}: {
  label: string;
  current: number;
  total: number;
  tone: string;
  bar: string;
}) {
  const pct = total > 0 ? Math.min(100, (current / total) * 100) : 0;
  return (
    <div
      className="min-w-[92px] rounded-lg border border-paper/10 bg-ink/60 px-2.5 py-1"
      aria-label={`${label}: ${current} of ${total}`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-mono text-[8px] uppercase tracking-widest text-paper/40">
          {label}
        </span>
        <span className={`font-display text-sm ${tone}`}>
          {current}/{total}
        </span>
      </div>
      <div className="mt-1 h-1 overflow-hidden rounded-full bg-paper/15">
        <div
          className={`h-full rounded-full transition-[width] duration-300 ${bar}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

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
  const targetsDown = (hud.totalTargets ?? 0) - (hud.targetsLeft ?? 0);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border-[3px] border-ink bg-cabinet px-4 py-2 shadow-stickerSm">
      <div className="flex min-w-0 items-center gap-2">
        <span className="truncate font-display text-sm uppercase text-token">
          {title}
        </span>
        {mode && mode !== "classic" ? <ModeBadge mode={mode} /> : null}
        {hud.goalLocked ? (
          <span
            className="font-mono text-[10px] uppercase text-marquee"
            aria-label="goal locked"
          >
            🔒 Locked
          </span>
        ) : null}
      </div>

      <div className="flex flex-wrap items-stretch gap-1.5">
        {hud.totalTargets ? (
          <ProgressGauge
            label="Drones"
            current={targetsDown}
            total={hud.totalTargets}
            tone="text-marquee"
            bar="bg-marquee"
          />
        ) : null}
        {hud.dodgeTarget ? (
          <ProgressGauge
            label="Dodged"
            current={hud.avoided ?? 0}
            total={hud.dodgeTarget}
            tone="text-screen"
            bar="bg-screen"
          />
        ) : null}
        {hud.totalCollectibles ? (
          <ProgressGauge
            label="Loot"
            current={hud.collectibles}
            total={hud.totalCollectibles}
            tone="text-token"
            bar="bg-token"
          />
        ) : null}
        {hud.timeLeftMs !== undefined ? (
          <div
            className={`min-w-[92px] rounded-lg border px-2.5 py-1 ${
              rushCritical
                ? "animate-pulse border-marquee bg-marquee/15"
                : "border-paper/10 bg-ink/60"
            }`}
            aria-label="time remaining"
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-mono text-[8px] uppercase tracking-widest text-paper/40">
                Left
              </span>
              <span
                className={`font-display text-sm ${
                  rushCritical ? "text-marquee" : "text-paper"
                }`}
              >
                {formatMs(Math.max(0, hud.timeLeftMs))}
              </span>
            </div>
            <div className="mt-1 h-1 overflow-hidden rounded-full bg-paper/15">
              <div
                className={`h-full rounded-full transition-[width] duration-300 ${
                  rushCritical ? "bg-marquee" : "bg-screen"
                }`}
                style={{
                  width: `${Math.max(
                    0,
                    Math.min(100, (hud.timeLeftMs / 60_000) * 100),
                  )}%`,
                }}
              />
            </div>
          </div>
        ) : null}
        <Gauge label="Time" value={formatMs(hud.elapsedMs)} ariaLabel="elapsed time" />
        <Gauge
          label="Deaths"
          value={String(hud.deaths)}
          tone={hud.deaths > 0 ? "text-marquee" : undefined}
          ariaLabel="deaths"
        />
      </div>
    </div>
  );
}
