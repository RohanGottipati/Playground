import { formatMs, formatPercent, formatRelativeTime } from "@/components/ui/formatters";
import type { Leaderboard } from "@/lib/db/types";

export function LeaderboardPanel({ leaderboard }: { leaderboard: Leaderboard }) {
  return (
    <div className="panel">
      <h2 className="marquee-title mb-3 text-lg text-token">Leaderboard</h2>
      <dl className="mb-3 grid grid-cols-3 gap-2 font-mono text-[11px] uppercase text-paper/70">
        <div>
          <dt className="text-paper/50">Plays</dt>
          <dd>{leaderboard.plays}</dd>
        </div>
        <div>
          <dt className="text-paper/50">Finish rate</dt>
          <dd>{formatPercent(leaderboard.completionRate)}</dd>
        </div>
        <div>
          <dt className="text-paper/50">Deaths</dt>
          <dd>{leaderboard.deaths}</dd>
        </div>
      </dl>

      {leaderboard.entries.length === 0 ? (
        <p className="font-mono text-xs text-paper/60">
          Nobody has finished this one yet. Be the first.
        </p>
      ) : (
        <ol className="space-y-1 font-mono text-xs text-paper/80">
          {leaderboard.entries.map((entry) => (
            <li key={`${entry.rank}-${entry.completedAt}`} className="flex justify-between gap-2">
              <span>
                {entry.rank}. {entry.creatorLabel}
              </span>
              <span>
                {formatMs(entry.durationMs)} · {entry.deaths} deaths ·{" "}
                {formatRelativeTime(entry.completedAt)}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
