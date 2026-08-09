"use client";

import { useMemo } from "react";
import type { GameMode, GameRules } from "@/game/types";
import { inferCanDie } from "@/lib/stats/canDie";
import type { DashboardEntity, DashboardWorld, DeathPoint } from "./types";

function computeLethality(
  entities: DashboardEntity[],
  points: DeathPoint[],
): { label: string; percent: number } | null {
  const hazards = entities.filter((entity) => entity.mechanic === "hazard");
  if (hazards.length === 0 || points.length === 0) return null;

  let best: { label: string; count: number } | null = null;
  for (const hazard of hazards) {
    const cx = hazard.bounds.x + hazard.bounds.width / 2;
    const cy = hazard.bounds.y + hazard.bounds.height / 2;
    const radius = Math.max(90, Math.max(hazard.bounds.width, hazard.bounds.height) * 1.5);
    const count = points.filter((point) => Math.hypot(point.x - cx, point.y - cy) <= radius).length;
    if (!best || count > best.count) {
      best = { label: hazard.sourceLabel ?? "Unlabeled hazard", count };
    }
  }
  if (!best || best.count === 0) return null;
  return { label: best.label, percent: (best.count / points.length) * 100 };
}

export function DeathHeatmap({
  world,
  entities,
  points,
  gameTitle,
  rules,
  mode,
}: {
  world: DashboardWorld;
  entities: DashboardEntity[];
  points: DeathPoint[];
  gameTitle: string;
  rules?: GameRules;
  mode?: GameMode;
}) {
  const inferredCanDie = useMemo(
    () => inferCanDie(entities, rules, mode),
    [entities, rules, mode],
  );
  // Recorded data is authoritative even if generated prose says the game is safe.
  const canDie = points.length > 0 || inferredCanDie;
  const plottedPoints = points;
  const lethality = useMemo(
    () => (canDie ? computeLethality(entities, plottedPoints) : null),
    [canDie, entities, plottedPoints],
  );
  const hazards = canDie ? entities.filter((entity) => entity.mechanic === "hazard") : [];

  return (
    <div className="rounded-3xl bg-appleBg p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="font-inter text-base font-medium text-appleInk">
          Spatial death heatmap
        </h3>
      </div>

      <div className="overflow-hidden rounded-2xl border border-appleGray/20 bg-[#0a0908]">
        <svg
          viewBox={`0 0 ${world.width} ${world.height}`}
          className="aspect-[16/9] w-full"
          role="img"
          aria-label={`Death heatmap for ${gameTitle}`}
        >
          <defs>
            <filter id="deathGlowBlur" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="26" />
            </filter>
            <pattern id="deskGrid" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#f6efe2" strokeOpacity="0.05" strokeWidth="2" />
            </pattern>
          </defs>

          <rect x={0} y={0} width={world.width} height={world.height} fill="url(#deskGrid)" />

          {hazards.map((hazard) => (
            <g key={hazard.id}>
              <rect
                x={hazard.bounds.x}
                y={hazard.bounds.y}
                width={hazard.bounds.width}
                height={hazard.bounds.height}
                fill="none"
                stroke="#ff5d73"
                strokeOpacity={0.6}
                strokeWidth={2}
                strokeDasharray="6 4"
                rx={4}
              />
              <text
                x={hazard.bounds.x + hazard.bounds.width / 2}
                y={hazard.bounds.y - 8}
                fill="#ff5d73"
                fontSize={20}
                textAnchor="middle"
                fontFamily="ui-monospace, monospace"
              >
                {hazard.sourceLabel ?? "hazard"}
              </text>
            </g>
          ))}

          <g style={{ mixBlendMode: "plus-lighter" }} filter="url(#deathGlowBlur)">
            {plottedPoints.map((point, index) => (
              <circle key={index} cx={point.x} cy={point.y} r={34} fill="#ff2d3d" fillOpacity={0.55} />
            ))}
          </g>

          {plottedPoints.map((point, index) => (
            <circle key={`core-${index}`} cx={point.x} cy={point.y} r={4} fill="#ffdede" fillOpacity={0.85} />
          ))}
        </svg>
      </div>

      <div className="mt-3 font-inter text-xs text-appleGray">
        {!canDie && plottedPoints.length === 0 ? (
          <p>
            No way to die in {gameTitle} — nothing to plot.
          </p>
        ) : lethality ? (
          <p>
            <span className="font-medium text-appleInk">Lethality callout:</span> {gameTitle} “{lethality.label}”
            hazard: <span className="font-medium text-appleBlue">{lethality.percent.toFixed(0)}%</span> of the
            recorded level fatalities.
          </p>
        ) : (
          <p>Not enough fatality data yet to call out a hotspot.</p>
        )}
        <p className="mt-1 text-appleGray/70">{plottedPoints.length} recent death(s) plotted.</p>
      </div>
    </div>
  );
}
