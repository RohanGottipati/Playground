import { randomUUID } from "crypto";
import { failure, ok } from "@/lib/api/respond";
import { AppError } from "@/lib/errors/AppError";
import { storeSourceImage, validateImage } from "@/lib/storage/images";
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
    const bytes = new Uint8Array(await file.arrayBuffer());
    const stored = await storeSourceImage(gameId, bytes, file.type);

    logDiagnostic("upload.completed", {
      gameId,
      bytes: bytes.byteLength,
      mimeType: file.type,
    });

    return ok({ gameId, imagePath: stored.path, imageUrl: stored.url });
  } catch (error) {
    return failure("upload.failed", error);
  }
}
