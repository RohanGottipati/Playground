"use client";

import type { HudState } from "@/game/bus";
import { formatMs } from "@/components/ui/formatters";
import { modeMeta } from "@/components/ui/difficulty";

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
      className="flex flex-col items-center justify-center rounded-xl bg-white px-3 py-1.5 leading-tight"
      aria-label={ariaLabel}
    >
      <span
        className="font-inter text-[10px] font-medium uppercase tracking-wide text-appleGray"
        style={{ letterSpacing: "-0.01em" }}
      >
        {label}
      </span>
      <span
        className={`font-inter font-medium ${tone ?? "text-appleInk"}`}
        style={{ fontSize: 15, letterSpacing: "-0.02em" }}
      >
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
      className="min-w-[92px] rounded-xl bg-white px-3 py-1.5"
      aria-label={`${label}: ${current} of ${total}`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span
          className="font-inter text-[10px] font-medium uppercase tracking-wide text-appleGray"
          style={{ letterSpacing: "-0.01em" }}
        >
          {label}
        </span>
        <span
          className={`font-inter font-medium ${tone}`}
          style={{ fontSize: 15, letterSpacing: "-0.02em" }}
        >
          {current}/{total}
        </span>
      </div>
      <div className="mt-1 h-1 overflow-hidden rounded-full bg-appleGray/20">
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
  const meta = mode && mode !== "classic" ? modeMeta(mode) : null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-appleBg px-4 py-3">
      <div className="flex min-w-0 items-center gap-2">
        <span
          className="truncate font-inter font-medium text-appleInk"
          style={{ fontSize: 15, letterSpacing: "-0.02em" }}
        >
          {title}
        </span>
        {meta ? (
          <span
            className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 font-inter text-xs font-medium text-appleInk"
            style={{ letterSpacing: "-0.01em" }}
          >
            <span aria-hidden>{meta.icon}</span> {meta.label}
          </span>
        ) : null}
        {hud.goalLocked ? (
          <span
            className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 font-inter text-xs font-medium text-appleGray"
            style={{ letterSpacing: "-0.01em" }}
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
            tone="text-appleInk"
            bar="bg-appleBlue"
          />
        ) : null}
        {hud.dodgeTarget ? (
          <ProgressGauge
            label="Dodged"
            current={hud.avoided ?? 0}
            total={hud.dodgeTarget}
            tone="text-appleInk"
            bar="bg-appleBlue"
          />
        ) : null}
        {hud.totalCollectibles ? (
          <ProgressGauge
            label="Loot"
            current={hud.collectibles}
            total={hud.totalCollectibles}
            tone="text-appleInk"
            bar="bg-appleBlue"
          />
        ) : null}
        {hud.timeLeftMs !== undefined ? (
          <div
            className={`min-w-[92px] rounded-xl px-3 py-1.5 ${
              rushCritical ? "animate-pulse bg-appleRed/10" : "bg-white"
            }`}
            aria-label="time remaining"
          >
            <div className="flex items-baseline justify-between gap-2">
              <span
                className="font-inter text-[10px] font-medium uppercase tracking-wide text-appleGray"
                style={{ letterSpacing: "-0.01em" }}
              >
                Left
              </span>
              <span
                className={`font-inter font-medium ${
                  rushCritical ? "text-appleRed" : "text-appleInk"
                }`}
                style={{ fontSize: 15, letterSpacing: "-0.02em" }}
              >
                {formatMs(Math.max(0, hud.timeLeftMs))}
              </span>
            </div>
            <div className="mt-1 h-1 overflow-hidden rounded-full bg-appleGray/20">
              <div
                className={`h-full rounded-full transition-[width] duration-300 ${
                  rushCritical ? "bg-appleRed" : "bg-appleBlue"
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
          tone={hud.deaths > 0 ? "text-appleRed" : undefined}
          ariaLabel="deaths"
        />
      </div>
    </div>
  );
}
