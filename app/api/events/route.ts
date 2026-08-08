import { failure, ok } from "@/lib/api/respond";
import {
  EventRequestSchema,
  MAX_EVENT_PAYLOAD_BYTES,
} from "@/lib/analytics/eventSchemas";
import { repository } from "@/lib/db";
import { AppError } from "@/lib/errors/AppError";
import { checkRateLimit, clientKey, RATE_LIMITS } from "@/lib/utils/rateLimit";

export const runtime = "nodejs";

const MIN_PLAUSIBLE_COMPLETION_MS = 1500;

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

    await db.recordEvent({ gameId, sessionId, eventType, payload });

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
