"use client";

import type { RuntimeLeaderboardEntry } from "@/lib/db/types";

function formatDuration(durationMs: number): string {
  return `${(durationMs / 1000).toFixed(1)}s`;
}

export function RuntimeLeaderboard({
  entries,
  gameTitle,
}: {
  entries: RuntimeLeaderboardEntry[];
  gameTitle: string;
}) {
  return (
    <div className="rounded-3xl bg-appleBg p-5">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h3 className="font-inter text-base font-medium text-appleInk">
          Best runtimes
        </h3>
        <p className="truncate font-inter text-[11px] text-appleGray">{gameTitle}</p>
      </div>
      {entries.length === 0 ? (
        <p className="font-inter text-xs text-appleGray">
          No completions recorded for this game yet.
        </p>
      ) : (
        <ol className="max-h-56 divide-y divide-white overflow-y-auto">
          {entries.map((entry, index) => (
            <li
              key={`${index}-${entry.durationMs}`}
              className="flex items-center justify-between gap-3 py-2 font-inter text-xs first:pt-0 last:pb-0"
            >
              <span className="flex min-w-0 items-center gap-2.5">
                <span
                  className={`w-5 shrink-0 tabular-nums ${
                    index === 0 ? "font-medium text-appleBlue" : "text-appleGray"
                  }`}
                >
                  {index + 1}
                </span>
                <span className="truncate text-appleGray">
                  {entry.city ?? "Unknown location"}
                </span>
              </span>
              <span
                className={`shrink-0 tabular-nums ${
                  index === 0 ? "font-medium text-appleBlue" : "text-appleInk"
                }`}
              >
                {formatDuration(entry.durationMs)}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
