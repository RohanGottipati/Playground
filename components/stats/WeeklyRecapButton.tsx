"use client";

import { useState } from "react";
import type { StatsSnapshot } from "@/lib/db/types";
import { WeeklyRecapModal } from "./WeeklyRecapModal";

export function WeeklyRecapButton({ stats }: { stats: StatsSnapshot }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="shrink-0 rounded-full bg-appleInk px-5 py-2.5 font-inter text-sm font-medium text-white transition hover:bg-black"
        style={{ letterSpacing: "-0.02em" }}
      >
        Your Playground Weekly Recap
      </button>
      {open ? <WeeklyRecapModal stats={stats} onClose={() => setOpen(false)} /> : null}
    </>
  );
}
