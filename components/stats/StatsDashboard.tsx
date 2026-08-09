"use client";

import { useEffect, useState } from "react";
import { formatPercent } from "@/components/ui/formatters";
import type { StatsSnapshot } from "@/lib/db/types";
import {
  ActivityFeed,
  BarChart,
  LineChart,
  MetricCard,
  ScatterChart,
} from "./Charts";

const REFRESH_MS = 20_000;

export function StatsDashboard({ initial }: { initial: StatsSnapshot }) {
  const [stats, setStats] = useState(initial);

  useEffect(() => {
    const timer = setInterval(async () => {
      try {
        const response = await fetch("/api/stats");
        if (response.ok) setStats((await response.json()) as StatsSnapshot);
      } catch (error) {
        console.warn("stats refresh failed", error);
      }
    }, REFRESH_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard label="Games published" value={String(stats.publishedGames)} />
        <MetricCard label="Objects scanned" value={String(stats.objectsScanned)} />
        <MetricCard label="Games played" value={String(stats.gamesPlayed)} />
        <MetricCard
          label="Average completion"
          value={formatPercent(stats.averageCompletionRate)}
          hint={`${stats.completedRuns} finished runs`}
        />
        <MetricCard label="Total deaths" value={String(stats.totalDeaths)} />
        <MetricCard
          label="Mechanics discovered"
          value={String(stats.mechanicsDiscovered)}
        />
        <MetricCard label="Remixes" value={String(stats.remixesCreated)} />
        <MetricCard
          label="Completed runs"
          value={String(stats.completedRuns)}
          hint="finished at least once"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <BarChart
          title="Most photographed objects"
          data={stats.topObjects}
          emptyMessage="No objects scanned yet."
        />
        <BarChart
          title="Mechanic usage"
          data={stats.mechanicUsage.map((row) => ({
            label: row.mechanic.replace(/_/g, " "),
            count: row.count,
          }))}
          emptyMessage="No mechanics generated yet."
        />
        <LineChart
          title="Games published over time"
          data={stats.gamesOverTime}
          emptyMessage="No games published yet."
        />
        <ScatterChart
          title="Difficulty vs completion"
          data={stats.difficultyVsCompletion}
          emptyMessage="Not enough plays yet."
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <ActivityFeed items={stats.recentActivity} />
        <div className="rounded-3xl bg-appleBg p-5">
          <h3
            className="mb-3 font-inter font-medium text-appleInk"
            style={{ fontSize: 16, letterSpacing: "-0.02em" }}
          >
            Mechanic discoveries
          </h3>
          {stats.discoveries.length === 0 ? (
            <p className="font-inter text-xs text-appleGray" style={{ letterSpacing: "-0.01em" }}>
              Nothing discovered yet. Photograph something unusual.
            </p>
          ) : (
            <ul className="divide-y divide-white">
              {stats.discoveries.slice(0, 20).map((discovery) => (
                <li
                  key={discovery.id}
                  className="py-1.5 font-inter text-xs text-appleGray first:pt-0 last:pb-0"
                  style={{ letterSpacing: "-0.01em" }}
                >
                  <span className="text-appleInk">{discovery.objectLabel}</span>
                  {" → "}
                  {discovery.mechanic.replace(/_/g, " ")} ·{" "}
                  {discovery.discoveryCount}×
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
