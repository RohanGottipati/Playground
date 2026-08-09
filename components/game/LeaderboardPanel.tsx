import { formatMs, formatPercent, formatRelativeTime } from "@/components/ui/formatters";
import type { Leaderboard } from "@/lib/db/types";

export function LeaderboardPanel({ leaderboard }: { leaderboard: Leaderboard }) {
  return (
    <div className="rounded-2xl bg-appleBg p-5">
      <h2
        className="mb-3 font-inter font-medium text-appleInk"
        style={{ fontSize: 15, letterSpacing: "-0.02em" }}
      >
        Leaderboard
      </h2>
      <dl
        className="mb-3 grid grid-cols-3 gap-2 font-inter text-appleGray"
        style={{ fontSize: 11, letterSpacing: "-0.01em" }}
      >
        <div>
          <dt className="text-appleGray/70">Plays</dt>
          <dd className="font-medium text-appleInk">{leaderboard.plays}</dd>
        </div>
        <div>
          <dt className="text-appleGray/70">Finish rate</dt>
          <dd className="font-medium text-appleInk">
            {formatPercent(leaderboard.completionRate)}
          </dd>
        </div>
        <div>
          <dt className="text-appleGray/70">Deaths</dt>
          <dd className="font-medium text-appleInk">{leaderboard.deaths}</dd>
        </div>
      </dl>

      {leaderboard.entries.length === 0 ? (
        <p
          className="font-inter text-appleGray"
          style={{ fontSize: 13, letterSpacing: "-0.01em" }}
        >
          Nobody has finished this one yet. Be the first.
        </p>
      ) : (
        <ol className="space-y-1.5">
          {leaderboard.entries.map((entry) => (
            <li
              key={`${entry.rank}-${entry.completedAt}`}
              className="flex items-center justify-between gap-2 rounded-xl bg-white px-3 py-2"
            >
              <span
                className="truncate font-inter font-medium text-appleInk"
                style={{ fontSize: 13, letterSpacing: "-0.01em" }}
              >
                {entry.rank}. {entry.creatorLabel}
              </span>
              <span
                className="shrink-0 font-inter text-appleGray"
                style={{ fontSize: 11, letterSpacing: "-0.01em" }}
              >
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
