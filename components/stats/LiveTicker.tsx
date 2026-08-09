"use client";

import type { SpatialEventRecord } from "@/lib/db/types";

function eventLine(event: SpatialEventRecord): string {
  const city = event.city ?? "Unknown location";
  if (event.eventType === "game_completed") {
    const duration = event.durationMs == null
      ? "an unknown time"
      : `${(event.durationMs / 1000).toFixed(1)}s`;
    return `${city} completed ${event.gameTitle} in ${duration}`;
  }

  const coordinates = event.x == null || event.y == null
    ? "at an unknown position"
    : `at (${event.x}, ${event.y})`;
  return `${city} recorded a fatality in ${event.gameTitle} ${coordinates}`;
}

export function LiveTicker({ events }: { events: SpatialEventRecord[] }) {
  return (
    <div className="rounded-3xl bg-appleBg p-5">
      <h3 className="mb-3 font-inter text-base font-medium text-appleInk">
        Live activity
      </h3>
      {events.length === 0 ? (
        <p className="font-inter text-xs text-appleGray">
          Waiting for the first completion or fatality.
        </p>
      ) : (
        <ul className="max-h-56 divide-y divide-white overflow-y-auto" aria-live="polite">
          {events.map((event) => (
            <li
              key={`${event.createdAt}-${event.eventType}`}
              className="py-2 font-inter text-xs text-appleGray first:pt-0 last:pb-0"
            >
              {eventLine(event)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
