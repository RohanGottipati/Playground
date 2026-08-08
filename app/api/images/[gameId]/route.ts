import { getMemoryImage } from "@/lib/storage/images";

export const runtime = "nodejs";

/**
 * Serves photos held by the in-memory store used when Supabase Storage is not
 * configured. With Supabase configured, images are served from Storage instead.
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ gameId: string }> },
) {
  const { gameId } = await context.params;
  const image = getMemoryImage(gameId);
  if (!image) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(new Uint8Array(image.bytes), {
    headers: {
      "Content-Type": image.mimeType,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
