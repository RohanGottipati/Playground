"use client";

export const MAX_IMAGE_DIMENSION = 1600;
export const TARGET_QUALITY = 0.85;

/**
 * Downscales and re-encodes a photo in the browser so uploads stay small.
 * Returns the original file when the browser cannot decode it.
 */
export async function compressImage(file: File): Promise<File> {
  if (typeof window === "undefined" || !("createImageBitmap" in window)) {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(
      1,
      MAX_IMAGE_DIMENSION / Math.max(bitmap.width, bitmap.height),
    );
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return file;
    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", TARGET_QUALITY);
    });
    if (!blob) return file;

    return new File([blob], "snapcade-photo.jpg", { type: "image/jpeg" });
  } catch (error) {
    console.warn("image compression failed, using original", error);
    return file;
  }
}
