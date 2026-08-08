"use client";

import type { StatsSnapshot } from "@/lib/db/types";
import { formatPercent } from "@/components/ui/formatters";

export function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border-[3px] border-ink bg-cabinet p-4 shadow-sticker">
      <p className="font-mono text-[11px] uppercase tracking-wide text-paper/60">
        {label}
      </p>
      <p className="marquee-title text-2xl text-token">{value}</p>
      {hint ? <p className="font-mono text-[11px] text-paper/50">{hint}</p> : null}
    </div>
  );
}

export function BarChart({
  title,
  data,
  emptyMessage,
}: {
  title: string;
  data: { label: string; count: number }[];
  emptyMessage: string;
}) {
  const max = Math.max(1, ...data.map((row) => row.count));
  return (
    <div className="panel">
      <h3 className="marquee-title mb-3 text-base text-token">{title}</h3>
      {data.length === 0 ? (
        <p className="font-mono text-xs text-paper/60">{emptyMessage}</p>
      ) : (
        <ul className="space-y-2">
          {data.map((row) => (
            <li key={row.label} className="font-mono text-[11px] uppercase">
              <div className="flex justify-between text-paper/70">
                <span className="truncate">{row.label}</span>
                <span>{row.count}</span>
              </div>
              <div className="h-3 w-full rounded border-2 border-ink bg-ink/60">
                <div
                  className="h-full rounded-sm bg-screen"
                  style={{ width: `${(row.count / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function LineChart({
  title,
  data,
  emptyMessage,
}: {
  title: string;
  data: { date: string; count: number }[];
  emptyMessage: string;
}) {
  const width = 320;
  const height = 120;
  const max = Math.max(1, ...data.map((row) => row.count));
  const points = data
    .map((row, index) => {
      const x = data.length === 1 ? width / 2 : (index / (data.length - 1)) * width;
      const y = height - (row.count / max) * (height - 12) - 6;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <div className="panel">
      <h3 className="marquee-title mb-3 text-base text-token">{title}</h3>
      {data.length === 0 ? (
        <p className="font-mono text-xs text-paper/60">{emptyMessage}</p>
      ) : (
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-32 w-full"
          role="img"
          aria-label={title}
        >
          <polyline
            points={points}
            fill="none"
            stroke="#7ce7c8"
            strokeWidth={3}
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );
}

export function ScatterChart({
  title,
  data,
  emptyMessage,
}: {
  title: string;
  data: StatsSnapshot["difficultyVsCompletion"];
  emptyMessage: string;
}) {
  const width = 320;
  const height = 160;
  const played = data.filter((row) => row.plays > 0);

  return (
    <div className="panel">
      <h3 className="marquee-title mb-3 text-base text-token">{title}</h3>
      {played.length === 0 ? (
        <p className="font-mono text-xs text-paper/60">{emptyMessage}</p>
      ) : (
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-40 w-full"
          role="img"
          aria-label={title}
        >
          {played.map((row) => (
            <circle
              key={row.slug}
              cx={((row.difficulty - 1) / 4) * (width - 24) + 12}
              cy={height - row.completionRate * (height - 24) - 12}
              r={5}
              fill="#ffcf5c"
              stroke="#14110f"
              strokeWidth={2}
            >
              <title>{`${row.title}: difficulty ${row.difficulty}, ${formatPercent(row.completionRate)} completion`}</title>
            </circle>
          ))}
        </svg>
      )}
      <p className="mt-2 font-mono text-[10px] uppercase text-paper/50">
        x: difficulty 1–5 · y: completion rate
      </p>
    </div>
  );
}

export function ActivityFeed({
  items,
}: {
  items: StatsSnapshot["recentActivity"];
}) {
  return (
    <div className="panel">
      <h3 className="marquee-title mb-3 text-base text-token">Live activity</h3>
      {items.length === 0 ? (
        <p className="font-mono text-xs text-paper/60">
          Nothing yet. Published games and plays show up here.
        </p>
      ) : (
        <ul className="space-y-1 font-mono text-[11px] text-paper/70">
          {items.map((item, index) => (
            <li key={`${item.createdAt}-${index}`}>
              {item.type.replace(/_/g, " ")} {item.label ? `· ${item.label}` : ""}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
