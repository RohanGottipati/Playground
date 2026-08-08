import sharp from "sharp";
import { describe, expect, it } from "vitest";
import {
  MAX_IMAGE_DIMENSION,
  normalizeSourceImage,
} from "@/lib/storage/images";

describe("source image normalization", () => {
  it("turns a supported source into an sRGB JPEG within the size limit", async () => {
    const source = await sharp({
      create: {
        width: 1800,
        height: 900,
        channels: 4,
        background: { r: 255, g: 196, b: 0, alpha: 0.6 },
      },
    })
      .png()
      .toBuffer();

    const normalized = await normalizeSourceImage(new Uint8Array(source));
    const metadata = await sharp(normalized.bytes).metadata();

    expect(normalized.mimeType).toBe("image/jpeg");
    expect(metadata.format).toBe("jpeg");
    expect(metadata.width).toBe(MAX_IMAGE_DIMENSION);
    expect(metadata.height).toBe(800);
    expect(metadata.space).toBe("srgb");
  });

  it("rejects bytes that are not a decodable image", async () => {
    await expect(
      normalizeSourceImage(new Uint8Array([1, 2, 3, 4])),
    ).rejects.toMatchObject({ code: "INVALID_IMAGE", retryable: false });
  });
});
