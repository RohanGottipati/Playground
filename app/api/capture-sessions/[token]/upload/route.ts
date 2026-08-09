import { failure, ok } from "@/lib/api/respond";
import {
  claimCaptureUpload,
  completeCaptureUpload,
  releaseCaptureUpload,
} from "@/lib/capture/sessions";
import { AppError } from "@/lib/errors/AppError";
import { uploadSourceFile } from "@/lib/storage/sourceUpload";
import { checkRateLimit, clientKey, RATE_LIMITS } from "@/lib/utils/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;
  let claimed = false;
  try {
    checkRateLimit(
      clientKey(request, "capture-upload"),
      RATE_LIMITS.captureUpload,
    );
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      throw new AppError("INVALID_IMAGE", "missing file field");
    }

    const session = await claimCaptureUpload(token);
    claimed = true;
    const upload = await uploadSourceFile(file, session.gameId);
    await completeCaptureUpload(token, upload);
    claimed = false;

    const response = ok({ sent: true });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    if (claimed) {
      await releaseCaptureUpload(token).catch(() => undefined);
    }
    const response = failure("capture_session.upload_failed", error);
    response.headers.set("Cache-Control", "no-store");
    return response;
  }
}
