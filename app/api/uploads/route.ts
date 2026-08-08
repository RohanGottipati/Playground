import { randomUUID } from "crypto";
import { failure, ok } from "@/lib/api/respond";
import { AppError } from "@/lib/errors/AppError";
import {
  normalizeSourceImage,
  storeSourceImage,
  validateImage,
} from "@/lib/storage/images";
import { checkRateLimit, clientKey, RATE_LIMITS } from "@/lib/utils/rateLimit";
import { logDiagnostic } from "@/lib/utils/logger";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    checkRateLimit(clientKey(request, "upload"), RATE_LIMITS.upload);

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      throw new AppError("INVALID_IMAGE", "missing file field");
    }
    validateImage(file);

    const gameId = randomUUID();
    const originalBytes = new Uint8Array(await file.arrayBuffer());
    const normalized = await normalizeSourceImage(originalBytes);
    const stored = await storeSourceImage(
      gameId,
      normalized.bytes,
      normalized.mimeType,
    );

    logDiagnostic("upload.completed", {
      gameId,
      originalBytes: originalBytes.byteLength,
      normalizedBytes: normalized.bytes.byteLength,
      originalMimeType: file.type,
      storedMimeType: normalized.mimeType,
    });

    return ok({ gameId, imagePath: stored.path, imageUrl: stored.url });
  } catch (error) {
    return failure("upload.failed", error);
  }
}
