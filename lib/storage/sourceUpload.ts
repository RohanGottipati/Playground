import { randomUUID } from "crypto";
import { logDiagnostic } from "@/lib/utils/logger";
import {
  normalizeSourceImage,
  storeSourceImage,
  validateImage,
} from "./images";

export type SourceUploadResult = {
  gameId: string;
  imagePath: string;
  imageUrl: string;
};

/**
 * Shared source-photo pipeline used by direct browser uploads and QR phone
 * captures. The server always decodes and normalizes the file even when the
 * browser has already compressed it.
 */
export async function uploadSourceFile(
  file: File,
  gameId: string = randomUUID(),
): Promise<SourceUploadResult> {
  validateImage(file);
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

  return { gameId, imagePath: stored.path, imageUrl: stored.url };
}
