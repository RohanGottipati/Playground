"use client";

import { useState } from "react";
import type { GameSummary } from "@/lib/db/types";
import { PlaygroundGrid } from "./PlaygroundGrid";

export function PlaygroundBrowseAllSection({
  initialGames,
}: {
  initialGames: GameSummary[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <section className="space-y-4">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 text-left"
      >
        <h2
          className="font-inter font-medium text-appleInk"
          style={{ fontSize: 20, letterSpacing: "-0.03em" }}
        >
          Browse All Games
        </h2>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className={`text-appleGray transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        >
          <path
            d="M3.5 6L8 10.5L12.5 6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open ? <PlaygroundGrid initialGames={initialGames} /> : null}
    </section>
  );
}
