import { failure, ok } from "@/lib/api/respond";
import { repository } from "@/lib/db";
import { AppError } from "@/lib/errors/AppError";

export const runtime = "nodejs";

/** Returns a game by id or slug. Drafts are only returned when asked by id. */
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const db = repository();
    const game = (await db.getGameById(id)) ?? (await db.getGameBySlug(id));
    if (!game) throw new AppError("NOT_FOUND", "game not found");

    const summary = await db.getGameSummary(game.id);

    return ok({
      game: {
        id: game.id,
        slug: game.slug,
        title: game.title,
        creatorName: game.creatorName,
        status: game.status,
        theme: game.theme,
        difficulty: game.difficulty,
        sourceImageUrl: game.sourceImageUrl,
        detectedObjectCount: game.detectedObjectCount,
        publishedAt: game.publishedAt,
        parentGameId: game.parentGameId,
        gameSpec: game.gameSpec,
        sceneAnalysis: game.sceneAnalysis,
      },
      summary: summary ?? null,
    });
  } catch (error) {
    return failure("game.fetch_failed", error);
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const adminSecret = process.env.GAME_EVENT_SECRET;
    const provided = _request.headers.get("x-admin-secret");
    if (!adminSecret || provided !== adminSecret) {
      throw new AppError("NOT_FOUND", "unpublish requires the admin secret");
    }
    const { id } = await context.params;
    await repository().unpublishGame(id);
    return ok({ unpublished: true });
  } catch (error) {
    return failure("game.unpublish_failed", error);
  }
}
