"use client";

import type { LucideIcon } from "lucide-react";
import { Activity, Skull, Boxes } from "lucide-react";
import type { ReactNode } from "react";

function MetricShell({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="relative rounded-2xl border-[3px] border-ink bg-cabinet/90 p-4 shadow-sticker">
      <div className="flex items-center gap-2 text-paper/60">
        <Icon className="h-4 w-4" aria-hidden />
        <p className="font-mono text-[11px] uppercase tracking-wide">{label}</p>
      </div>
      {children}
    </div>
  );
}

export function ObjectsScannedCard({
  yourTotal,
  globalTotal,
}: {
  yourTotal: number;
  globalTotal: number;
}) {
  return (
    <MetricShell icon={Boxes} label="Physical objects scanned">
      <div className="mt-2 flex items-end gap-4">
        <div>
          <p className="marquee-title text-2xl text-token">{globalTotal.toLocaleString()}</p>
          <p className="font-mono text-[10px] uppercase text-paper/50">Global community total</p>
        </div>
        <div>
          <p className="marquee-title text-lg text-screen">{yourTotal.toLocaleString()}</p>
          <p className="font-mono text-[10px] uppercase text-paper/50">Your total</p>
        </div>
      </div>
    </MetricShell>
  );
}

export function FatalitiesCard({
  count,
  gameTitle,
}: {
  count: number;
  gameTitle: string;
}) {
  return (
    <MetricShell icon={Skull} label="Fatalities — selected game">
      <p className="marquee-title mt-2 text-2xl text-marquee">{count.toLocaleString()}</p>
      <p className="truncate font-mono text-[10px] uppercase text-paper/50">{gameTitle}</p>
    </MetricShell>
  );
}

export function ActiveSessionsCard({
  count,
  gameTitle,
}: {
  count: number;
  gameTitle: string;
}) {
  return (
    <MetricShell icon={Activity} label="Active sessions — selected game">
      <p className="marquee-title mt-2 text-2xl text-screen">{count.toLocaleString()}</p>
      <p className="truncate font-mono text-[10px] uppercase text-paper/50">
        {gameTitle} · last 5 min
      </p>
    </MetricShell>
  );
}
