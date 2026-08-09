"use client";

import type { GameRules } from "@/game/types";
import { DifficultyBadge, ModeBadge } from "@/components/ui/Badge";

type Props = {
  rules: GameRules;
  mode: string;
  difficulty: number;
  /** Play is disabled until the game engine is ready to unpause. */
  ready: boolean;
  onStart: () => void;
};

/**
 * Pre-game overlay explaining this run's specific objective. The scene stays
 * paused (ControlState.started === false) until the player presses Play.
 */
export function GameRulesModal({ rules, mode, difficulty, ready, onStart }: Props) {
  return (
    <div
      className="absolute inset-0 z-20 flex items-center justify-center bg-ink/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rules-headline"
    >
      <div className="panel max-h-full w-full max-w-md space-y-4 overflow-y-auto">
        <div className="flex flex-wrap items-center gap-2">
          <ModeBadge mode={mode} />
          <DifficultyBadge difficulty={difficulty} />
        </div>

        <h2 id="rules-headline" className="marquee-title text-xl text-token">
          {rules.headline}
        </h2>
        <p className="font-body text-sm text-paper/90">{rules.objective}</p>

        <ol className="list-decimal space-y-1 pl-5 font-mono text-xs text-paper/80">
          {rules.howToPlay.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ol>

        <div className="flex flex-wrap gap-2">
          {rules.controls.map((control) => (
            <span
              key={control}
              className="rounded-md border-2 border-ink bg-cabinet px-2 py-1 font-mono text-[11px] uppercase text-paper/80"
            >
              {control}
            </span>
          ))}
        </div>

        {rules.tip ? (
          <p className="rounded-lg border-2 border-ink bg-ink/40 p-3 font-mono text-[11px] text-paper/70">
            💡 {rules.tip}
          </p>
        ) : null}

        <button
          type="button"
          className="btn-primary w-full text-lg"
          disabled={!ready}
          onClick={onStart}
        >
          {ready ? "Play" : "Loading…"}
        </button>
      </div>
    </div>
  );
}
