import { failure, ok } from "@/lib/api/respond";
import { repository } from "@/lib/db";
import { AppError } from "@/lib/errors/AppError";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ gameId: string }> },
) {
  try {
    const { gameId } = await context.params;
    const db = repository();
    const game = (await db.getGameById(gameId)) ?? (await db.getGameBySlug(gameId));
    if (!game) throw new AppError("NOT_FOUND", "unknown game");

    return ok(await db.getLeaderboard(game.id));
  } catch (error) {
    return failure("leaderboard.failed", error);
  }
}
