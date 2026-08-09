"use client";

import { Radio } from "lucide-react";

export function LiveTicker({ events }: { events: string[] }) {
  return (
    <div className="panel">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="marquee-title flex items-center gap-2 text-base text-token">
          <Radio className="h-4 w-4 animate-pulse text-marquee" aria-hidden />
          Live stream
        </h3>
      </div>
      {events.length === 0 ? (
        <p className="font-mono text-xs text-paper/50">Waiting for the first event…</p>
      ) : (
        <ul
          className="h-56 space-y-1.5 overflow-y-auto font-mono text-[11px] text-paper/80"
          aria-live="polite"
        >
          {events.map((line, index) => (
            <li
              key={`${index}-${line}`}
              className={`truncate border-b border-ink/60 pb-1.5 ${
                index === 0 ? "text-screen" : ""
              }`}
            >
              {line}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
