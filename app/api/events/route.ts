import { failure, ok } from "@/lib/api/respond";
import {
  EventRequestSchema,
  MAX_EVENT_PAYLOAD_BYTES,
} from "@/lib/analytics/eventSchemas";
import { repository } from "@/lib/db";
import { TICKER_EVENT_TYPES } from "@/lib/db/types";
import { AppError } from "@/lib/errors/AppError";
import { lookupCity } from "@/lib/geo/lookupCity";
import {
  checkRateLimit,
  clientKey,
  extractClientIp,
  RATE_LIMITS,
} from "@/lib/utils/rateLimit";

export const runtime = "nodejs";

const MIN_PLAUSIBLE_COMPLETION_MS = 1500;
// Every gameplay action the live ticker can narrate: playing, progressing,
// dying, clearing. Enriched with an approximate city on write.
const TICKER_EVENT_TYPE_SET: Set<string> = new Set(TICKER_EVENT_TYPES);

export async function POST(request: Request) {
  try {
    checkRateLimit(clientKey(request, "events"), RATE_LIMITS.events);

    const body = await request.text();
    if (body.length > MAX_EVENT_PAYLOAD_BYTES) {
      throw new AppError("SCHEMA_VALIDATION_FAILED", "event payload too large");
    }

    const parsed = EventRequestSchema.safeParse(JSON.parse(body));
    if (!parsed.success) {
      throw new AppError("SCHEMA_VALIDATION_FAILED", "invalid event");
    }

    const { gameId, sessionId, eventType, payload, run } = parsed.data;
    const db = repository();
    const game = await db.getGameById(gameId);
    if (!game) throw new AppError("NOT_FOUND", "unknown game");

    // Ticker-worthy events are enriched with an approximate, city-level
    // location. The raw IP is never stored.
    let recordedPayload = payload;
    if (TICKER_EVENT_TYPE_SET.has(eventType)) {
      const city = await lookupCity(extractClientIp(request));
      recordedPayload = { ...payload, city };
    }

    await db.recordEvent({ gameId, sessionId, eventType, payload: recordedPayload });

    if (sessionId && run) {
      const completed = eventType === "game_completed";
      // Client timings are advisory: implausible completions are not stored.
      const plausible =
        run.elapsedMs == null || run.elapsedMs >= MIN_PLAUSIBLE_COMPLETION_MS;

      await db.updateSession(sessionId, {
        deathCount: run.deaths,
        collectiblesCollected: run.collectibles,
        completed: completed && plausible ? true : undefined,
        durationMs: completed && plausible ? run.elapsedMs : undefined,
      });
    }

    return ok({ recorded: true });
  } catch (error) {
    return failure("event.failed", error);
  }
}

const MAX_FATALITIES_DISPLAYED = 20;

function formatDuration(seconds: number | null): string {
  return seconds != null ? `${seconds.toFixed(1)}s` : "an unknown time";
}

function formatCoordinate(value: number | null): string {
  return value != null ? String(value) : "?";
}

export async function GET(request: Request) {
  try {
    checkRateLimit(clientKey(request, "telemetryRead"), RATE_LIMITS.telemetryRead);

    const url = new URL(request.url);
    // There is no account system: the per-user scanned count lives in the
    // requesting browser's localStorage and is only echoed back here so the
    // client can render one combined response.
    const requestedUserCount = Number.parseInt(
      url.searchParams.get("userObjectsScanned") ?? "0",
      10,
    );
    const totalObjectsScannedUser =
      Number.isFinite(requestedUserCount) && requestedUserCount > 0
        ? requestedUserCount
        : 0;

    // Optional scope: when the dashboard has a game selected, the ticker,
    // fatality/session maps and heatmap points are all filtered to just
    // that game instead of the whole arcade.
    const gameId = url.searchParams.get("gameId") || undefined;

    const db = repository();
    const [stats, telemetry] = await Promise.all([
      db.getStats(),
      db.getTelemetrySnapshot(gameId),
    ]);

    // Only two narrated action types reach the ticker: round completions
    // and fatalities. Everything else (opens, checkpoints, collectibles) is
    // still recorded and still counts toward active sessions, just silently.
    const recentEvents = telemetry.recentSpatialEvents.slice(0, 15).map((event) =>
      event.eventType === "clear"
        ? `Player from ${event.city} completed ${event.gameTitle} in ${formatDuration(event.durationSeconds)}`
        : `Fatality recorded in ${event.city} on ${event.gameTitle} at (X: ${formatCoordinate(event.x)}, Y: ${formatCoordinate(event.y)})`,
    );

    const pointsByGame = new Map<string, { x: number; y: number }[]>();
    for (const event of telemetry.recentSpatialEvents) {
      if (event.eventType !== "death" || event.x == null || event.y == null) continue;
      const points = pointsByGame.get(event.gameId) ?? [];
      if (points.length >= MAX_FATALITIES_DISPLAYED) continue;
      points.push({ x: event.x, y: event.y });
      pointsByGame.set(event.gameId, points);
    }

    const totalFatalitiesPerGame: Record<string, number> = {};
    for (const [gameId, count] of Object.entries(telemetry.deathTotalsByGame)) {
      totalFatalitiesPerGame[gameId] = Math.min(MAX_FATALITIES_DISPLAYED, count);
    }

    return ok({
      totalObjectsScannedGlobal: stats.objectsScanned,
      totalObjectsScannedUser,
      totalFatalitiesPerGame,
      activeSessionsByGame: telemetry.activeSessionsByGame,
      recentEvents,
      aggregateDeathsXY: [...pointsByGame.entries()].map(([gameId, points]) => ({
        gameId,
        points,
      })),
      topObjects: stats.topObjects,
    });
  } catch (error) {
    return failure("event.telemetry_failed", error);
  }
}
