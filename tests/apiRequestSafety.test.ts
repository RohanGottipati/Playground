import { randomUUID } from "crypto";
import { beforeEach, describe, expect, it } from "vitest";
import { POST as postEvent } from "@/app/api/events/route";
import { POST as postSession } from "@/app/api/events/session/route";
import { POST as postGenerate } from "@/app/api/games/generate/route";
import { POST as postLike } from "@/app/api/games/like/route";
import { POST as postPublish } from "@/app/api/games/publish/route";
import { POST as postUpload } from "@/app/api/uploads/route";
import { GET as getGame } from "@/app/api/games/[id]/route";
import { GET as getLeaderboard } from "@/app/api/leaderboard/[gameId]/route";
import { parseJson, readFormData, readJsonBody } from "@/lib/api/request";
import { resetRepository } from "@/lib/db";
import { SupabaseRepository } from "@/lib/db/supabase";
import { resetMemoryState } from "@/lib/db/memory";
import { AppError } from "@/lib/errors/AppError";
import { resetRateLimits } from "@/lib/utils/rateLimit";

/**
 * A malformed request must never read as a server fault. Every case below
 * returned a 500 before the body readers and the UUID guard existed.
 */

beforeEach(() => {
  resetRateLimits();
  resetMemoryState();
  resetRepository();
});

function jsonRequest(body: string): Request {
  return new Request("https://playground.test/api", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
}

describe("body readers", () => {
  it("rejects unparseable JSON as a client error", () => {
    try {
      parseJson("not json");
      expect.unreachable("parseJson should throw");
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).code).toBe("SCHEMA_VALIDATION_FAILED");
      expect((error as AppError).status).toBe(422);
    }
  });

  it("rejects an empty body as a client error", async () => {
    await expect(readJsonBody(jsonRequest(""))).rejects.toMatchObject({
      code: "SCHEMA_VALIDATION_FAILED",
      status: 422,
    });
  });

  it("still parses a well-formed body", async () => {
    await expect(readJsonBody(jsonRequest('{"a":1}'))).resolves.toEqual({ a: 1 });
  });

  it("rejects a non-multipart body as an invalid upload", async () => {
    await expect(readFormData(jsonRequest("{}"))).rejects.toMatchObject({
      code: "INVALID_IMAGE",
      status: 400,
    });
  });
});

describe("POST routes reject malformed bodies without a 500", () => {
  const handlers: [string, (request: Request) => Promise<Response>][] = [
    ["events", postEvent],
    ["events/session", postSession],
    ["games/like", postLike],
    ["games/publish", postPublish],
    ["games/generate", postGenerate],
  ];

  for (const [name, handler] of handlers) {
    it(`${name} answers 422 for a truncated body`, async () => {
      const response = await handler(jsonRequest('{"gameId":'));
      expect(response.status).toBe(422);
    });

    it(`${name} answers 422 for a body that is not JSON`, async () => {
      const response = await handler(jsonRequest("not json"));
      expect(response.status).toBe(422);
    });
  }

  it("uploads answers 400 when the body is not a multipart form", async () => {
    const response = await postUpload(jsonRequest("{}"));
    expect(response.status).toBe(400);
  });
});

describe("id-or-slug routes tolerate a non-UUID segment", () => {
  it("games/[id] answers 404 rather than failing on the id lookup", async () => {
    const response = await getGame(new Request("https://playground.test/api"), {
      params: Promise.resolve({ id: "some-published-slug" }),
    });
    expect(response.status).toBe(404);
  });

  it("leaderboard/[gameId] answers 404 rather than failing on the id lookup", async () => {
    const response = await getLeaderboard(
      new Request("https://playground.test/api"),
      { params: Promise.resolve({ gameId: "some-published-slug" }) },
    );
    expect(response.status).toBe(404);
  });
});

/**
 * Postgres rejects a non-UUID comparison against a `uuid` column with 22P02.
 * The guard has to short-circuit before the query so a slug can fall through to
 * the slug lookup. No Supabase credentials are configured under vitest, so
 * reaching the client at all throws — which is exactly what proves the
 * short-circuit happened.
 */
describe("SupabaseRepository UUID guard", () => {
  const db = new SupabaseRepository();

  it("treats a non-UUID id as a miss without querying", async () => {
    await expect(db.getGameById("some-published-slug")).resolves.toBeUndefined();
    await expect(db.getGameSummary("some-published-slug")).resolves.toBeUndefined();
  });

  it("rejects a non-UUID unpublish as not-found", async () => {
    await expect(db.unpublishGame("some-published-slug")).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });

  it("does query for a well-formed UUID", async () => {
    // Guard passes, so the unconfigured client is reached and complains.
    await expect(db.getGameById(randomUUID())).rejects.toThrow(/not configured/i);
  });
});
