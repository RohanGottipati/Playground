import {
  isSupabaseConfigured,
  SOURCE_IMAGE_BUCKET,
  supabaseAdmin,
} from "@/lib/supabase/admin";
import { AppError } from "@/lib/errors/AppError";

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];

export type StoredImage = { path: string; url: string };

const memoryImages = globalThis as unknown as {
  __playgroundImages?: Map<string, { bytes: Uint8Array; mimeType: string }>;
};

function memoryStore() {
  if (!memoryImages.__playgroundImages) memoryImages.__playgroundImages = new Map();
  return memoryImages.__playgroundImages;
}

export function getMemoryImage(gameId: string) {
  return memoryStore().get(gameId);
}

function extensionFor(mimeType: string): string {
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  if (mimeType === "image/heic" || mimeType === "image/heif") return "heic";
  return "jpg";
}

export function validateImage(file: File): void {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new AppError("INVALID_IMAGE", `unsupported mime type ${file.type}`);
  }
  if (file.size <= 0 || file.size > MAX_UPLOAD_BYTES) {
    throw new AppError("INVALID_IMAGE", `unsupported size ${file.size}`);
  }
}

/**
 * Stores the source photo. Uses Supabase Storage when configured, otherwise it
 * keeps the bytes in the server process and serves them from /api/images.
 */
export async function storeSourceImage(
  gameId: string,
  bytes: Uint8Array,
  mimeType: string,
): Promise<StoredImage> {
  const path = `${gameId}/original.${extensionFor(mimeType)}`;

  if (!isSupabaseConfigured()) {
    memoryStore().set(gameId, { bytes, mimeType });
    return { path: `memory://${path}`, url: `/api/images/${gameId}` };
  }

  const client = supabaseAdmin();
  const { error } = await client.storage
    .from(SOURCE_IMAGE_BUCKET)
    .upload(path, new Uint8Array(bytes), {
      contentType: mimeType,
      upsert: true,
    });

  if (error) {
    throw new AppError("UPLOAD_FAILED", `storage upload failed: ${error.message}`);
  }

  const { data } = client.storage.from(SOURCE_IMAGE_BUCKET).getPublicUrl(path);
  return { path: `${SOURCE_IMAGE_BUCKET}/${path}`, url: data.publicUrl };
}
