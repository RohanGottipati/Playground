"use client";

import type { RunResult } from "@/game/bus";
import { formatMs, formatPercent } from "@/components/ui/formatters";
import type { Leaderboard } from "@/lib/db/types";

type Props = {
  result: RunResult;
  leaderboard: Leaderboard | null;
  shareUrl?: string;
  onRestart: () => void;
  onRemix?: () => void;
};

export function GameResults({
  result,
  leaderboard,
  shareUrl,
  onRestart,
  onRemix,
}: Props) {
  async function share() {
    if (!shareUrl) return;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Snapcade", url: shareUrl });
        return;
      }
      await navigator.clipboard.writeText(shareUrl);
    } catch (error) {
      console.warn("share failed", error);
    }
  }

  return (
    <div className="panel space-y-4" role="status">
      <h2 className="marquee-title text-xl text-token">Run complete</h2>
      <dl className="grid grid-cols-2 gap-3 font-mono text-sm sm:grid-cols-4">
        <Stat label="Your time" value={formatMs(result.elapsedMs)} />
        <Stat label="Deaths" value={String(result.deaths)} />
        <Stat
          label="Collected"
          value={`${result.collectibles}/${result.totalCollectibles}`}
        />
        <Stat
          label="Community best"
          value={formatMs(leaderboard?.fastestMs ?? null)}
        />
      </dl>

      {leaderboard ? (
        <p className="font-mono text-xs uppercase text-paper/70">
          {leaderboard.plays} plays · {formatPercent(leaderboard.completionRate)}{" "}
          completion · {leaderboard.deaths} total deaths
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button type="button" className="btn-primary" onClick={onRestart}>
          Play again
        </button>
        {shareUrl ? (
          <button type="button" className="btn-secondary" onClick={share}>
            Share
          </button>
        ) : null}
        {onRemix ? (
          <button type="button" className="btn-ghost" onClick={onRemix}>
            Remix with your own objects
          </button>
        ) : null}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border-2 border-ink bg-ink/40 p-3">
      <dt className="text-[10px] uppercase tracking-wide text-paper/60">{label}</dt>
      <dd className="text-lg text-paper">{value}</dd>
    </div>
  );
}
