import { failure, ok } from "@/lib/api/respond";
import {
  EventRequestSchema,
  MAX_EVENT_PAYLOAD_BYTES,
  TelemetryQuerySchema,
} from "@/lib/analytics/eventSchemas";
import { repository } from "@/lib/db";
import { TELEMETRY_EVENT_TYPES } from "@/lib/db/types";
import { AppError } from "@/lib/errors/AppError";
import { platformCity } from "@/lib/geo/platformCity";
import {
  checkRateLimit,
  clientKey,
  RATE_LIMITS,
} from "@/lib/utils/rateLimit";

export const runtime = "nodejs";

const MIN_PLAUSIBLE_COMPLETION_MS = 1500;
const TELEMETRY_EVENT_TYPE_SET: Set<string> = new Set(TELEMETRY_EVENT_TYPES);

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

    // Spatial events use the canonical gameplay rows. A deployment-supplied
    // city is optional; no IP address is stored or sent to a third party.
    let recordedPayload = payload;
    if (TELEMETRY_EVENT_TYPE_SET.has(eventType)) {
      const city = platformCity(request);
      recordedPayload = city ? { ...payload, city } : payload;
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

export async function GET(request: Request) {
  try {
    checkRateLimit(clientKey(request, "telemetryRead"), RATE_LIMITS.telemetryRead);

    const url = new URL(request.url);
    const parsed = TelemetryQuerySchema.safeParse({
      gameId: url.searchParams.get("gameId"),
    });
    if (!parsed.success) {
      throw new AppError("SCHEMA_VALIDATION_FAILED", "valid gameId required");
    }

    const db = repository();
    const game = await db.getGameById(parsed.data.gameId);
    if (!game || game.status !== "published") {
      throw new AppError("NOT_FOUND", "published game not found");
    }

    return ok(await db.getTelemetrySnapshot(game.id));
  } catch (error) {
    return failure("event.telemetry_failed", error);
  }
}
