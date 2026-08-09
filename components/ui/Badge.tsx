import type { ReactNode } from "react";
import { modeMeta, tierFor } from "./difficulty";

export function Badge({
  children,
  tone = "paper",
}: {
  children: ReactNode;
  tone?: "paper" | "marquee" | "token" | "screen";
}) {
  const tones = {
    paper: "bg-paper text-ink",
    marquee: "bg-marquee text-paper",
    token: "bg-token text-ink",
    screen: "bg-screen text-ink",
  } as const;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border-2 border-ink px-2 py-[3px] font-mono text-[11px] uppercase tracking-wide shadow-stickerSm ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function ModeBadge({ mode }: { mode: string }) {
  const meta = modeMeta(mode);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border-2 border-ink px-2 py-[3px] font-mono text-[11px] uppercase tracking-wide shadow-stickerSm ${meta.chip}`}
    >
      <span aria-hidden>{meta.icon}</span> {meta.label}
    </span>
  );
}

/**
 * A five-notch meter rather than a word: the filled bars make the campaign's
 * ramp legible at a glance while scrolling the Playground.
 */
export function DifficultyBadge({
  difficulty,
  size = "sm",
}: {
  difficulty: number;
  size?: "sm" | "lg";
}) {
  const tier = tierFor(difficulty);
  const large = size === "lg";

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-md border-2 border-ink bg-ink/80 shadow-stickerSm ${
        large ? "px-3 py-1.5" : "px-2 py-[4px]"
      }`}
      title={`Difficulty ${tier.level} of 5 — ${tier.label}`}
    >
      <span className="flex items-end gap-[2px]" aria-hidden>
        {[1, 2, 3, 4, 5].map((notch) => (
          <span
            key={notch}
            className={`${large ? "w-[5px]" : "w-[3px]"} rounded-[1px] ${
              notch <= tier.level ? tier.bg : "bg-paper/20"
            }`}
            style={{ height: (large ? 6 : 4) + notch * (large ? 3 : 2) }}
          />
        ))}
      </span>
      <span
        className={`font-mono uppercase tracking-wide ${tier.text} ${
          large ? "text-xs" : "text-[10px]"
        }`}
      >
        {tier.label}
      </span>
      <span className="sr-only">Difficulty {tier.level} of 5</span>
    </span>
  );
}
