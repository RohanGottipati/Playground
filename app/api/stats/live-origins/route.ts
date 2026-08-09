import { failure, ok } from "@/lib/api/respond";
import { repository } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return ok(await repository().getLiveOriginSnapshot());
  } catch (error) {
    return failure("stats.live_origins_failed", error);
  }
}
