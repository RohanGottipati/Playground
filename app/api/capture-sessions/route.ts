import { failure, ok } from "@/lib/api/respond";
import { createCaptureSession } from "@/lib/capture/sessions";
import { checkRateLimit, clientKey, RATE_LIMITS } from "@/lib/utils/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    checkRateLimit(
      clientKey(request, "capture-create"),
      RATE_LIMITS.captureCreate,
    );
    const session = await createCaptureSession();
    const response = ok(
      {
        capturePath: `/capture/${session.captureToken}`,
        statusToken: session.statusToken,
        expiresAt: session.expiresAt,
      },
      201,
    );
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    return failure("capture_session.create_failed", error);
  }
}
