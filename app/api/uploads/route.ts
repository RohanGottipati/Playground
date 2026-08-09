import { failure, ok } from "@/lib/api/respond";
import { readFormData } from "@/lib/api/request";
import { AppError } from "@/lib/errors/AppError";
import { uploadSourceFile } from "@/lib/storage/sourceUpload";
import { checkRateLimit, clientKey, RATE_LIMITS } from "@/lib/utils/rateLimit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    checkRateLimit(clientKey(request, "upload"), RATE_LIMITS.upload);

    const form = await readFormData(request);
    const file = form.get("file");
    if (!(file instanceof File)) {
      throw new AppError("INVALID_IMAGE", "missing file field");
    }
    return ok(await uploadSourceFile(file));
  } catch (error) {
    return failure("upload.failed", error);
  }
}
