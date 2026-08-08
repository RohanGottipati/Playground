import { failure, ok } from "@/lib/api/respond";
import { SessionRequestSchema } from "@/lib/analytics/eventSchemas";
import { repository } from "@/lib/db";
import { AppError } from "@/lib/errors/AppError";
import { checkRateLimit, clientKey, RATE_LIMITS } from "@/lib/utils/rateLimit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    checkRateLimit(clientKey(request, "events"), RATE_LIMITS.events);

    const parsed = SessionRequestSchema.safeParse(await request.json());
    if (!parsed.success) {
      throw new AppError("SCHEMA_VALIDATION_FAILED", "invalid session request");
    }

    const db = repository();
    const game = await db.getGameById(parsed.data.gameId);
    if (!game) throw new AppError("NOT_FOUND", "unknown game");

    const session = await db.createSession({
      gameId: parsed.data.gameId,
      anonymousSessionId: parsed.data.anonymousSessionId,
      userAgent: request.headers.get("user-agent"),
    });

    return ok({ sessionId: session.id });
  } catch (error) {
    return failure("session.failed", error);
  }
}
