"use client";

import { Trophy } from "lucide-react";

export type RuntimeLeaderboardRow = {
  rank: number;
  city: string;
  time: string;
};

export function RuntimeLeaderboard({
  entries,
  gameTitle,
}: {
  entries: RuntimeLeaderboardRow[];
  gameTitle: string;
}) {
  return (
    <div className="panel">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="marquee-title flex items-center gap-2 text-base text-token">
          <Trophy className="h-4 w-4 text-screen" aria-hidden />
          Best runtimes leaderboard
        </h3>
        <p className="truncate font-mono text-[10px] uppercase text-paper/50">{gameTitle}</p>
      </div>
      {entries.length === 0 ? (
        <p className="font-mono text-xs text-paper/50">
          No completions recorded for this game yet.
        </p>
      ) : (
        <ol className="space-y-1.5 font-mono text-xs text-paper/80">
          {entries.map((entry) => (
            <li
              key={entry.rank}
              className="flex items-center justify-between border-b border-ink/60 pb-1.5 last:border-0 last:pb-0"
            >
              <span className="flex items-center gap-2">
                <span className={`w-7 ${entry.rank === 1 ? "text-screen" : "text-token"}`}>
                  #{entry.rank}
                </span>
                <span className="text-paper/70">{entry.city}</span>
              </span>
              <span className="text-token">{entry.time}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
