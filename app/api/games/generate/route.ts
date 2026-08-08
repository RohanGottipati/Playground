import { failure, ok } from "@/lib/api/respond";
import { GenerateRequestSchema } from "@/lib/analytics/eventSchemas";
import { analyzeImage } from "@/lib/backboard/client";
import { AI_SCHEMA_VERSION } from "@/lib/backboard/schemas";
import { generateLevel } from "@/game/generation/generateLevel";
import { mechanicForObject } from "@/game/generation/assignMechanics";
import { normalizeObjects } from "@/game/generation/normalizeObjects";
import { repository } from "@/lib/db";
import { AppError } from "@/lib/errors/AppError";
import { getMemoryImage } from "@/lib/storage/images";
import { checkRateLimit, clientKey, RATE_LIMITS } from "@/lib/utils/rateLimit";
import { logDiagnostic } from "@/lib/utils/logger";

export const runtime = "nodejs";
export const maxDuration = 60;

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
    const { analysis, metadata } = await analyzeImage({
      image: bytes,
      fileName: `${gameId}.jpg`,
      mimeType,
      seed: gameId,
    });

    const spec = generateLevel(analysis, { imageUrl });

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
      eventType: metadata.fallbackUsed ? "generation_failed" : "generation_completed",
      payload: {
        label: spec.title,
        attempts: metadata.attemptCount,
        latencyMs: metadata.latencyMs,
        status: metadata.status,
      },
    });

    logDiagnostic("generation.completed", {
      gameId,
      attempts: metadata.attemptCount,
      latencyMs: metadata.latencyMs,
      status: metadata.status,
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
        fallbackUsed: metadata.fallbackUsed,
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
