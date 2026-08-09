"use client";

import type { GameEventType } from "@/game/types";

const SESSION_STORAGE_KEY = "playground.anonymousSessionId";

export function anonymousSessionId(): string {
  if (typeof window === "undefined") return "server";
  const existing = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (existing) return existing;
  const created =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `anon-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
  window.localStorage.setItem(SESSION_STORAGE_KEY, created);
  return created;
}

export type TrackInput = {
  gameId: string;
  sessionId?: string;
  eventType: GameEventType;
  payload?: Record<string, string | number | boolean>;
  run?: { elapsedMs?: number; deaths?: number; collectibles?: number };
};

/** Fire-and-forget event submission. Never throws into gameplay code. */
export async function track(input: TrackInput): Promise<void> {
  try {
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...input, anonymousSessionId: anonymousSessionId() }),
      keepalive: true,
    });
  } catch (error) {
    console.warn("event submission failed", error);
  }
}

export type SpatialEventInput = {
  eventType: "death" | "clear";
  gameId: string;
  x: number;
  y: number;
  objectsScannedCount: number;
  durationSeconds: number;
  userObjectsScannedCount: number;
};

/**
 * Fire-and-forget spatial telemetry for death/clear heatmaps. Kept separate
 * from `track()` so a lookup failure or malformed payload here can never
 * affect session/run tracking.
 */
export async function recordSpatialEvent(input: SpatialEventInput): Promise<void> {
  try {
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gameId: input.gameId,
        eventType: input.eventType,
        anonymousSessionId: anonymousSessionId(),
        payload: {
          x: input.x,
          y: input.y,
          objectsScannedCount: input.objectsScannedCount,
          durationSeconds: Math.round(input.durationSeconds * 10) / 10,
          user_objects_scanned_count: input.userObjectsScannedCount,
        },
      }),
      keepalive: true,
    });
  } catch (error) {
    console.warn("spatial event submission failed", error);
  }
}

export async function startSession(gameId: string): Promise<string | undefined> {
  try {
    const response = await fetch("/api/events/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId, anonymousSessionId: anonymousSessionId() }),
    });
    if (!response.ok) return undefined;
    const body = (await response.json()) as { sessionId?: string };
    return body.sessionId;
  } catch (error) {
    console.warn("session creation failed", error);
    return undefined;
  }
}
