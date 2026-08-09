"use client";

import type { GameRules } from "@/game/types";
import { DifficultyBadge, ModeBadge } from "@/components/ui/Badge";
import { tierFor } from "@/components/ui/difficulty";
import { spriteUrl } from "@/components/ui/spriteUrl";

type Props = {
  rules: GameRules;
  mode: string;
  difficulty: number;
  /** Sprite of the photo's star object, shown as the level's hero art. */
  heroComponentId?: string;
  /** Play is disabled until the game engine is ready to unpause. */
  ready: boolean;
  onStart: () => void;
};

/** Renders "Jump: W, ↑ or Space" as a label plus individual keycaps. */
function ControlRow({ control }: { control: string }) {
  const [label, keys] = control.split(/:\s*/, 2);
  if (!keys) {
    return <span className="font-mono text-[11px] text-paper/70">{control}</span>;
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="font-mono text-[10px] uppercase tracking-wider text-paper/45">
        {label}
      </span>
      {keys.split(/\s*(?:,| or )\s*/).map((key) => (
        <kbd
          key={key}
          className="rounded border-2 border-ink bg-paper px-1.5 py-[1px] font-mono text-[10px] font-semibold text-ink shadow-stickerSm"
        >
          {key}
        </kbd>
      ))}
    </div>
  );
}

/**
 * Pre-game overlay explaining this run's specific objective. The scene stays
 * paused (ControlState.started === false) until the player presses Play.
 */
export function GameRulesModal({
  rules,
  mode,
  difficulty,
  heroComponentId,
  ready,
  onStart,
}: Props) {
  const tier = tierFor(difficulty);
  const hero = spriteUrl(heroComponentId);

  return (
    <div
      className="absolute inset-0 z-20 flex items-center justify-center bg-ink/85 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rules-headline"
    >
      <div className="flex max-h-full w-full max-w-2xl flex-col overflow-hidden rounded-2xl border-[3px] border-ink bg-cabinet shadow-sticker">
        <div className={`h-1.5 w-full shrink-0 bg-gradient-to-r ${tier.rail}`} />

        {/* Only the briefing scrolls — Play stays pinned and always reachable. */}
        <div className="grid min-h-0 flex-1 gap-5 overflow-y-auto p-5 sm:grid-cols-[auto_1fr]">
          <div className="flex flex-row items-center gap-4 sm:w-32 sm:flex-col sm:items-start">
            {hero ? (
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl border-2 border-ink bg-ink/60 p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={hero}
                  alt=""
                  aria-hidden
                  className="h-full w-full object-contain"
                />
              </div>
            ) : null}
            <div className="flex flex-wrap gap-2 sm:flex-col sm:items-start">
              <ModeBadge mode={mode} />
              <DifficultyBadge difficulty={difficulty} size="lg" />
            </div>
          </div>

          <div className="min-w-0 space-y-4">
            <div>
              <h2
                id="rules-headline"
                className="marquee-title text-2xl text-token"
              >
                {rules.headline}
              </h2>
              <p className="mt-1 font-body text-sm text-paper/90">
                {rules.objective}
              </p>
            </div>

            <ol className="space-y-1.5">
              {rules.howToPlay.map((line, index) => (
                <li key={line} className="flex gap-2">
                  <span
                    className={`mt-[1px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full font-mono text-[9px] text-ink ${tier.bg}`}
                  >
                    {index + 1}
                  </span>
                  <span className="font-body text-xs text-paper/80">{line}</span>
                </li>
              ))}
            </ol>

            <div className="space-y-1.5 rounded-lg border-2 border-ink bg-ink/40 p-3">
              {rules.controls.map((control) => (
                <ControlRow key={control} control={control} />
              ))}
            </div>

            {rules.tip ? (
              <p className="font-mono text-[11px] text-paper/60">
                💡 {rules.tip}
              </p>
            ) : null}
          </div>
        </div>

        <div className="shrink-0 border-t-[3px] border-ink bg-ink/50 p-3">
          <button
            type="button"
            className="btn-primary w-full text-lg"
            disabled={!ready}
            onClick={onStart}
          >
            {ready ? "Insert coin · Play" : "Loading…"}
          </button>
        </div>
      </div>
    </div>
  );
}
