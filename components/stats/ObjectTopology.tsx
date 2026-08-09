"use client";

import { PieChart } from "lucide-react";
import { useMemo } from "react";
import { DonutChart, type DonutDatum } from "./DonutChart";
import type { DashboardEntity } from "./types";

function groupBySourceLabel(entities: DashboardEntity[]): DonutDatum[] {
  const counts = new Map<string, number>();
  for (const entity of entities) {
    if (!entity.sourceLabel) continue;
    const label = entity.sourceLabel.trim();
    if (!label) continue;
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

export function ObjectTopology({
  gameTitle,
  gameEntities,
  globalTopObjects,
}: {
  gameTitle: string;
  gameEntities: DashboardEntity[];
  globalTopObjects: DonutDatum[];
}) {
  const gameData = useMemo(() => groupBySourceLabel(gameEntities), [gameEntities]);
  const globalData = useMemo(
    () => globalTopObjects.map((row) => ({ ...row, label: capitalize(row.label) })),
    [globalTopObjects],
  );

  return (
    <div className="panel">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="marquee-title flex items-center gap-2 text-base text-token">
          <PieChart className="h-4 w-4 text-cable" aria-hidden />
          Global desk topology
        </h3>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <p className="mb-2 truncate font-mono text-[11px] uppercase text-paper/50">
            {gameTitle} — objects in this game
          </p>
          <DonutChart data={gameData} emptyMessage="No object breakdown for this game yet." />
        </div>
        <div>
          <p className="mb-2 font-mono text-[11px] uppercase text-paper/50">
            Across every game — vision AI detections
          </p>
          <DonutChart data={globalData} emptyMessage="No objects scanned across the arcade yet." />
        </div>
      </div>
    </div>
  );
}

function capitalize(label: string): string {
  return label.length === 0 ? label : label[0].toUpperCase() + label.slice(1);
}
