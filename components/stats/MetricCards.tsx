"use client";

import type { ReactNode } from "react";

function MetricShell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl bg-appleBg p-4">
      <p className="font-inter text-xs font-medium uppercase tracking-wide text-appleGray">
        {label}
      </p>
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
    <MetricShell label="Physical objects scanned">
      <div className="mt-2 flex items-end gap-5">
        <div>
          <p className="font-inter text-2xl font-medium text-appleInk">
            {globalTotal.toLocaleString()}
          </p>
          <p className="font-inter text-[11px] text-appleGray">Community</p>
        </div>
        <div>
          <p className="font-inter text-lg font-medium text-appleBlue">
            {yourTotal.toLocaleString()}
          </p>
          <p className="font-inter text-[11px] text-appleGray">This browser</p>
        </div>
      </div>
    </MetricShell>
  );
}

export function FatalitiesCard({ count, gameTitle }: { count: number; gameTitle: string }) {
  return (
    <MetricShell label="Fatalities — selected game">
      <p className="mt-2 font-inter text-2xl font-medium text-appleInk">
        {count.toLocaleString()}
      </p>
      <p className="truncate font-inter text-[11px] text-appleGray">{gameTitle}</p>
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
    <MetricShell label="Active sessions — selected game">
      <p className="mt-2 font-inter text-2xl font-medium text-appleInk">
        {count.toLocaleString()}
      </p>
      <p className="truncate font-inter text-[11px] text-appleGray">
        {gameTitle} · last 5 minutes
      </p>
    </MetricShell>
  );
}
