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
    <div className="rounded-2xl bg-appleBg p-4">
      <p
        className="font-inter text-xs font-medium uppercase tracking-wide text-appleGray"
        style={{ letterSpacing: "0.02em" }}
      >
        {label}
      </p>
      <p
        className="mt-1 font-inter font-medium text-appleInk"
        style={{ fontSize: 26, letterSpacing: "-0.03em" }}
      >
        {value}
      </p>
      {hint ? (
        <p className="mt-0.5 font-inter text-xs text-appleGray" style={{ letterSpacing: "-0.01em" }}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl bg-appleBg p-5">
      <h3
        className="mb-3 font-inter font-medium text-appleInk"
        style={{ fontSize: 16, letterSpacing: "-0.02em" }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

function EmptyNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-inter text-xs text-appleGray" style={{ letterSpacing: "-0.01em" }}>
      {children}
    </p>
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
    <ChartCard title={title}>
      {data.length === 0 ? (
        <EmptyNote>{emptyMessage}</EmptyNote>
      ) : (
        <ul className="space-y-3">
          {data.map((row) => (
            <li key={row.label}>
              <div
                className="mb-1 flex justify-between font-inter text-xs text-appleGray"
                style={{ letterSpacing: "-0.01em" }}
              >
                <span className="truncate capitalize">{row.label}</span>
                <span className="font-medium text-appleInk">{row.count}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-white">
                <div
                  className="h-full rounded-full bg-appleInk"
                  style={{ width: `${(row.count / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </ChartCard>
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
    <ChartCard title={title}>
      {data.length === 0 ? (
        <EmptyNote>{emptyMessage}</EmptyNote>
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
            stroke="#0068c9"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </ChartCard>
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
    <ChartCard title={title}>
      {played.length === 0 ? (
        <EmptyNote>{emptyMessage}</EmptyNote>
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
              fill="#0068c9"
              stroke="#ffffff"
              strokeWidth={2}
            >
              <title>{`${row.title}: difficulty ${row.difficulty}, ${formatPercent(row.completionRate)} completion`}</title>
            </circle>
          ))}
        </svg>
      )}
      <p
        className="mt-2 font-inter text-[11px] text-appleGray"
        style={{ letterSpacing: "-0.01em" }}
      >
        x: difficulty 1–5 · y: completion rate
      </p>
    </ChartCard>
  );
}

export function ActivityFeed({
  items,
}: {
  items: StatsSnapshot["recentActivity"];
}) {
  return (
    <ChartCard title="Live activity">
      {items.length === 0 ? (
        <EmptyNote>Nothing yet. Published games and plays show up here.</EmptyNote>
      ) : (
        <ul className="divide-y divide-white">
          {items.map((item, index) => (
            <li
              key={`${item.createdAt}-${index}`}
              className="py-1.5 font-inter text-xs text-appleGray first:pt-0 last:pb-0"
              style={{ letterSpacing: "-0.01em" }}
            >
              <span className="capitalize text-appleInk">
                {item.type.replace(/_/g, " ")}
              </span>
              {item.label ? ` · ${item.label}` : ""}
            </li>
          ))}
        </ul>
      )}
    </ChartCard>
  );
}
