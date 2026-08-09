import { failure, ok } from "@/lib/api/respond";
import {
  cancelCaptureSession,
  desktopCaptureStatus,
} from "@/lib/capture/sessions";
import { AppError } from "@/lib/errors/AppError";
import { checkRateLimit, clientKey, RATE_LIMITS } from "@/lib/utils/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function bearerToken(request: Request): string {
  const authorization = request.headers.get("authorization") ?? "";
  const match = authorization.match(/^Bearer ([A-Za-z0-9_-]{43})$/);
  if (!match) throw new AppError("CAPTURE_NOT_FOUND", "missing status token");
  return match[1];
}

function noStore<T extends Response>(response: T): T {
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export async function GET(request: Request) {
  try {
    checkRateLimit(
      clientKey(request, "capture-status"),
      RATE_LIMITS.captureStatus,
    );
    return noStore(ok(await desktopCaptureStatus(bearerToken(request))));
  } catch (error) {
    return noStore(failure("capture_session.status_failed", error));
  }
}

export async function DELETE(request: Request) {
  try {
    checkRateLimit(
      clientKey(request, "capture-status"),
      RATE_LIMITS.captureStatus,
    );
    await cancelCaptureSession(bearerToken(request));
    return noStore(ok({ cancelled: true }));
  } catch (error) {
    return noStore(failure("capture_session.cancel_failed", error));
  }
}
