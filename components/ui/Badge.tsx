import type { ReactNode } from "react";

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

export function DifficultyBadge({ difficulty }: { difficulty: number }) {
  const labels = ["Gentle", "Easy", "Tricky", "Hard", "Brutal"];
  const label = labels[Math.min(4, Math.max(0, difficulty - 1))];
  return (
    <Badge tone={difficulty >= 4 ? "marquee" : "token"}>
      {"★".repeat(difficulty)} {label}
    </Badge>
  );
}
