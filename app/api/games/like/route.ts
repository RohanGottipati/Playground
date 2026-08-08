import { failure, ok } from "@/lib/api/respond";
import { LikeRequestSchema } from "@/lib/analytics/eventSchemas";
import { repository } from "@/lib/db";
import { AppError } from "@/lib/errors/AppError";
import { checkRateLimit, clientKey, RATE_LIMITS } from "@/lib/utils/rateLimit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    checkRateLimit(clientKey(request, "likes"), RATE_LIMITS.likes);

    const parsed = LikeRequestSchema.safeParse(await request.json());
    if (!parsed.success) {
      throw new AppError("SCHEMA_VALIDATION_FAILED", "invalid like request");
    }

    const db = repository();
    const game = await db.getGameById(parsed.data.gameId);
    if (!game) throw new AppError("NOT_FOUND", "unknown game");

    const likes = await db.toggleLike(
      parsed.data.gameId,
      parsed.data.anonymousSessionId,
    );
    return ok({ likes });
  } catch (error) {
    return failure("like.failed", error);
  }
}
