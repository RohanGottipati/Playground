import { failure, ok } from "@/lib/api/respond";
import { repository } from "@/lib/db";
import type { ArcadeSort } from "@/lib/db/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SORTS: ArcadeSort[] = [
  "campaign",
  "newest",
  "trending",
  "hardest",
  "fastest",
  "most_remixed",
];

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const sortParam = url.searchParams.get("sort") ?? "newest";
    const sort = SORTS.includes(sortParam as ArcadeSort)
      ? (sortParam as ArcadeSort)
      : "newest";
    const limit = Math.min(
      48,
      Math.max(1, Number(url.searchParams.get("limit") ?? 24)),
    );
    const offset = Math.max(0, Number(url.searchParams.get("offset") ?? 0));

    const games = await repository().listGames({ sort, limit, offset });
    return ok({ sort, limit, offset, games });
  } catch (error) {
    return failure("games.list_failed", error);
  }
}
