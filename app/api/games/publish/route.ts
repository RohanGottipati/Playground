import { failure, ok } from "@/lib/api/respond";
import { readJsonBody } from "@/lib/api/request";
import { PublishRequestSchema } from "@/lib/analytics/eventSchemas";
import { repository } from "@/lib/db";
import { discoveryPairs } from "@/lib/discovery/mechanicDiscovery";
import { AppError } from "@/lib/errors/AppError";
import { checkRateLimit, clientKey, RATE_LIMITS } from "@/lib/utils/rateLimit";
import { logDiagnostic } from "@/lib/utils/logger";
import { sanitizeCreatorName, sanitizeTitle } from "@/lib/utils/sanitize";
import { generateUniqueSlug } from "@/lib/utils/slug";
import type { MechanicType } from "@/game/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    checkRateLimit(clientKey(request, "publish"), RATE_LIMITS.publish);

    const parsed = PublishRequestSchema.safeParse(await readJsonBody(request));
    if (!parsed.success) {
      throw new AppError("SCHEMA_VALIDATION_FAILED", "invalid publish request");
    }

    const db = repository();
    const draft = await db.getGameById(parsed.data.gameId);
    if (!draft) throw new AppError("NOT_FOUND", "draft game not found");
    if (draft.status === "published" && draft.slug) {
      return ok({ gameId: draft.id, slug: draft.slug, alreadyPublished: true });
    }
    if (!draft.gameSpec.validation.reachable) {
      throw new AppError("LEVEL_UNREACHABLE", "cannot publish an unvalidated level");
    }

    const title = sanitizeTitle(parsed.data.title, draft.title);
    const creatorName = sanitizeCreatorName(parsed.data.creatorName);
    const slug = await generateUniqueSlug(title, (candidate) =>
      db.isSlugTaken(candidate),
    );

    const published = await db.publishGame({
      id: draft.id,
      title,
      creatorName,
      slug,
    });

    const mechanicByObjectId = new Map<string, MechanicType>();
    for (const entity of published.gameSpec.entities) {
      if (entity.sourceObjectId) {
        mechanicByObjectId.set(entity.sourceObjectId, entity.mechanic);
      }
    }
    const discoveries = await db.registerMechanicDiscoveries(
      published.id,
      discoveryPairs(published.sceneAnalysis.objects, mechanicByObjectId),
    );

    await db.recordEvent({
      gameId: published.id,
      eventType: "game_published",
      payload: { label: title, creatorName, difficulty: published.difficulty },
    });

    if (published.parentGameId) {
      await db.recordEvent({
        gameId: published.id,
        eventType: "game_remixed",
        payload: { label: title, parentGameId: published.parentGameId },
      });
    }

    for (const discovery of discoveries) {
      await db.recordEvent({
        gameId: published.id,
        eventType: "mechanic_discovered",
        payload: {
          label: `${discovery.objectLabel} → ${discovery.mechanic}`,
          mechanic: discovery.mechanic,
        },
      });
    }

    logDiagnostic("publish.completed", {
      gameId: published.id,
      slug,
      discoveries: discoveries.length,
    });

    return ok({
      gameId: published.id,
      slug,
      title,
      creatorName,
      discoveries,
      url: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/game/${slug}`,
    });
  } catch (error) {
    return failure("publish.failed", error);
  }
}
