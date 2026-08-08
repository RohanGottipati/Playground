import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { analyzeImage } from "@/lib/backboard/client";
import { deskScene } from "./fixtures/scenes";

const input = {
  image: new Uint8Array([0xff, 0xd8, 0xff, 0xd9]),
  fileName: "photo.jpg",
  mimeType: "image/jpeg",
};

function backboardResponse(
  content: string,
  overrides: Record<string, unknown> = {},
): Response {
  return new Response(
    JSON.stringify({
      content,
      status: "COMPLETED",
      thread_id: "8c75b810-8e20-4cc3-9bf5-479931634aaf",
      assistant_id: "ba572583-80dc-4798-b54e-99e7aa1a569c",
      model_provider: "openai",
      model_name: "gpt-4o",
      ...overrides,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
}

describe("Backboard image analysis", () => {
  beforeEach(() => {
    process.env.BACKBOARD_API_KEY = "test-key";
    process.env.BACKBOARD_PRIMARY_PROVIDER = "openai";
    process.env.BACKBOARD_PRIMARY_MODEL = "gpt-4o";
    delete process.env.BACKBOARD_ASSISTANT_ID;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("sends a MIME-correct image to GPT-4o", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(backboardResponse(JSON.stringify(deskScene)));
    vi.stubGlobal("fetch", fetchMock);

    const result = await analyzeImage(input);
    const request = fetchMock.mock.calls[0][1] as RequestInit;
    const form = request.body as FormData;
    const image = form.get("files") as File;

    expect(form.get("llm_provider")).toBe("openai");
    expect(form.get("model_name")).toBe("gpt-4o");
    expect(image.name).toBe("photo.jpg");
    expect(image.type).toBe("image/jpeg");
    expect(result.metadata).toMatchObject({
      llmProvider: "openai",
      modelName: "gpt-4o",
      attemptCount: 1,
      status: "ai",
    });
  });

  it("retries invalid JSON three times without changing models", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(backboardResponse("not json"))
      .mockResolvedValueOnce(backboardResponse('{"objects":[]}'))
      .mockResolvedValueOnce(backboardResponse(JSON.stringify(deskScene)));
    vi.stubGlobal("fetch", fetchMock);

    const result = await analyzeImage(input);

    expect(fetchMock).toHaveBeenCalledTimes(3);
    for (const call of fetchMock.mock.calls) {
      const form = (call[1] as RequestInit).body as FormData;
      expect(form.get("llm_provider")).toBe("openai");
      expect(form.get("model_name")).toBe("gpt-4o");
    }
    expect(result.metadata.attemptCount).toBe(3);
    expect(result.metadata.status).toBe("ai_repaired");
  });

  it("retries a transient provider error", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ detail: "upstream unavailable" }), {
          status: 503,
        }),
      )
      .mockResolvedValueOnce(backboardResponse(JSON.stringify(deskScene)));
    vi.stubGlobal("fetch", fetchMock);

    const result = await analyzeImage(input);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.metadata.attemptCount).toBe(2);
  });

  it("surfaces billing failures without creating a fallback scene", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      backboardResponse(
        "Your free credit cannot cover LLM chat. Add credits or a subscription.",
        { status: "FAILED" },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(analyzeImage(input)).rejects.toMatchObject({
      code: "BACKBOARD_CONFIGURATION_ERROR",
      retryable: false,
      details: expect.objectContaining({ reason: "billing" }),
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("rejects configuration that could switch away from GPT-4o", async () => {
    process.env.BACKBOARD_PRIMARY_MODEL = "gpt-4o-mini";
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(analyzeImage(input)).rejects.toMatchObject({
      code: "BACKBOARD_CONFIGURATION_ERROR",
      retryable: false,
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
