import { failure, ok } from "@/lib/api/respond";
import { GenerateRequestSchema } from "@/lib/analytics/eventSchemas";
import { analyzeImage } from "@/lib/backboard/client";
import { AI_SCHEMA_VERSION } from "@/lib/backboard/schemas";
import { PROMPT_VERSION } from "@/lib/backboard/prompts";
import {
  buildTemplateSpec,
  isTemplateId,
  type TemplateId,
} from "@/game/templates";
import { EMPTY_HINTS } from "@/game/generation/hints";
import { randomSeed } from "@/game/generation/rng";
import { mechanicForObject } from "@/game/generation/assignMechanics";
import { normalizeObjects } from "@/game/generation/normalizeObjects";
import { repository } from "@/lib/db";
import { AppError } from "@/lib/errors/AppError";
import { getMemoryImage } from "@/lib/storage/images";
import { checkRateLimit, clientKey, RATE_LIMITS } from "@/lib/utils/rateLimit";
import { logDiagnostic } from "@/lib/utils/logger";

export const runtime = "nodejs";
export const maxDuration = 60;

/** Dev-only QA override so each template can be exercised on demand. */
function devForcedTemplate(): TemplateId | undefined {
  if (process.env.NODE_ENV === "production") return undefined;
  const forced = process.env.PLAYGROUND_FORCE_TEMPLATE;
  return isTemplateId(forced) ? forced : undefined;
}

async function loadImage(
  gameId: string,
  imageUrl: string,
): Promise<{ bytes: Uint8Array; mimeType: string }> {
  const memory = getMemoryImage(gameId);
  if (memory) return memory;

  const absolute = imageUrl.startsWith("http")
    ? imageUrl
    : new URL(imageUrl, process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000")
        .toString();

  const response = await fetch(absolute);
  if (!response.ok) {
    throw new AppError("UPLOAD_FAILED", `could not read stored image (${response.status})`);
  }
  return {
    bytes: new Uint8Array(await response.arrayBuffer()),
    mimeType: response.headers.get("content-type") ?? "image/jpeg",
  };
}

export async function POST(request: Request) {
  try {
    checkRateLimit(clientKey(request, "generate"), RATE_LIMITS.generate);

    const parsed = GenerateRequestSchema.safeParse(await request.json());
    if (!parsed.success) {
      throw new AppError("SCHEMA_VALIDATION_FAILED", "invalid generate request");
    }
    const { gameId, imagePath, imageUrl, parentGameId } = parsed.data;
    if (!imagePath.includes(gameId) && !imageUrl.includes(gameId)) {
      throw new AppError("SCHEMA_VALIDATION_FAILED", "image does not belong to game");
    }

    const db = repository();
    logDiagnostic("generation.started", { gameId });

    const { bytes, mimeType } = await loadImage(gameId, imageUrl);
    // The analysis only decides which bundled components dress the fixed
    // template slots — layouts and objectives are hand-built and the template
    // itself is a seeded coin flip, never an AI decision.
    const { analysis, metadata } = await analyzeImage({
      image: bytes,
      fileName: `${gameId}.jpg`,
      mimeType,
    });

    // What the last few uploads produced, so this one can refuse to repeat it.
    const hints = await db.getGenerationHints().catch(() => EMPTY_HINTS);

    const spec = buildTemplateSpec(analysis, randomSeed(), {
      imageUrl,
      forceTemplate: devForcedTemplate(),
      recentTemplates: hints.recentTemplates,
    });

    const normalized = normalizeObjects(analysis);

    const record = await db.saveDraftGame({
      id: gameId,
      title: spec.title,
      sourceImagePath: imagePath,
      sourceImageUrl: imageUrl,
      sceneAnalysis: analysis,
      gameSpec: spec,
      generationLatencyMs: metadata.latencyMs,
      generationAttemptCount: Math.max(1, metadata.attemptCount),
      generationStatus: metadata.status,
      llmProvider: metadata.llmProvider,
      modelName: metadata.modelName,
      backboardAssistantId: metadata.backboardAssistantId,
      backboardThreadId: metadata.backboardThreadId,
      aiSchemaVersion: AI_SCHEMA_VERSION,
      parentGameId: parentGameId ?? null,
    });

    await db.saveGameObjects(
      gameId,
      normalized.map((object) => ({
        sourceObjectId: object.id,
        label: object.label,
        normalizedBounds: object.normalizedBounds,
        properties: object.properties,
        suggestedRole: object.role,
        finalMechanic: mechanicForObject(object),
        confidence: object.confidence,
      })),
    );

    await db.recordEvent({
      gameId,
      eventType: "generation_completed",
      payload: {
        label: spec.title,
        attempts: metadata.attemptCount,
        latencyMs: metadata.latencyMs,
        status: metadata.status,
      },
    });

    // Learning loop: persist this run so the stats pages stay truthful.
    await db
      .saveGenerationInsight({
        gameId,
        mode: spec.mode ?? "classic",
        seed: spec.seed ?? 0,
        theme: spec.theme,
        difficulty: spec.difficulty,
        title: spec.title,
        objectLabels: normalized.map((object) => object.label),
        mechanics: [
          ...new Set(spec.entities.map((entity) => entity.mechanic)),
        ],
        magicPatternsId: null,
        magicPatternsEditorUrl: null,
        promptVersion: PROMPT_VERSION,
      })
      .catch((error: unknown) => {
        logDiagnostic("generation.insight_failed", {
          gameId,
          message: error instanceof Error ? error.message : "unknown",
        });
      });

    logDiagnostic("generation.completed", {
      gameId,
      attempts: metadata.attemptCount,
      latencyMs: metadata.latencyMs,
      status: metadata.status,
      mode: spec.mode ?? "classic",
      template: spec.templateId ?? "unknown",
      seed: spec.seed ?? 0,
      difficulty: spec.difficulty,
      repaired: spec.validation.repaired,
    });

    return ok({
      gameId: record.id,
      sceneAnalysis: analysis,
      gameSpec: spec,
      generationMetadata: {
        latencyMs: metadata.latencyMs,
        attempts: metadata.attemptCount,
        status: metadata.status,
        warnings: metadata.warnings,
        provider: metadata.llmProvider ?? null,
        model: metadata.modelName ?? null,
      },
    });
  } catch (error) {
    return failure("generation.failed", error);
  }
}
