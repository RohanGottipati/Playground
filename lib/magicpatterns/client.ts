import { AppError } from "@/lib/errors/AppError";
import { logDiagnostic } from "@/lib/utils/logger";

/**
 * Magic Patterns design generation, called by the AI agent flow during game
 * generation:
 *
 *   [Prompt] -> [AI Agent] -> (API call) -> [Magic Patterns]
 *            -> [Editor URL & Spec] -> [Adapts Code]
 *
 * The v2 pattern endpoint accepts a prompt (plus the source photo) and
 * returns generated source files with an editor URL. Failures here are
 * always non-fatal: game generation continues with the built-in art style.
 */

const MAGIC_PATTERNS_ENDPOINT = "https://api.magicpatterns.com/api/v2/pattern";
const DEFAULT_TIMEOUT_MS = 25_000;

export type MagicPatternsSourceFile = {
  name: string;
  code: string;
};

export type MagicPatternsDesign = {
  designId?: string;
  editorUrl?: string;
  previewUrl?: string;
  sourceFiles: MagicPatternsSourceFile[];
};

export type CreateDesignInput = {
  prompt: string;
  image?: {
    bytes: Uint8Array;
    mimeType: string;
    fileName: string;
  };
};

export function isMagicPatternsConfigured(): boolean {
  return Boolean(process.env.MAGIC_PATTERNS_API_KEY);
}

function timeoutMs(): number {
  const raw = Number(process.env.MAGIC_PATTERNS_TIMEOUT_MS);
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_TIMEOUT_MS;
}

export async function createMagicPatternsDesign(
  input: CreateDesignInput,
): Promise<MagicPatternsDesign> {
  const apiKey = process.env.MAGIC_PATTERNS_API_KEY;
  if (!apiKey) {
    throw new AppError(
      "MAGIC_PATTERNS_UNAVAILABLE",
      "MAGIC_PATTERNS_API_KEY is not set",
    );
  }

  const form = new FormData();
  form.append("prompt", input.prompt);
  form.append("mode", "fast");
  form.append("modelSelector", "auto");
  if (input.image) {
    form.append(
      "images",
      new Blob([Uint8Array.from(input.image.bytes)], {
        type: input.image.mimeType,
      }),
      input.image.fileName,
    );
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs());
  const startedAt = Date.now();

  try {
    const response = await fetch(MAGIC_PATTERNS_ENDPOINT, {
      method: "POST",
      headers: { "x-mp-api-key": apiKey },
      body: form,
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new AppError(
        "MAGIC_PATTERNS_UNAVAILABLE",
        `magic patterns request failed (${response.status}): ${body.slice(0, 200)}`,
      );
    }

    const payload = (await response.json()) as {
      id?: string;
      editorUrl?: string;
      previewUrl?: string;
      sourceFiles?: { name?: string; code?: string }[];
    };

    const design: MagicPatternsDesign = {
      designId: typeof payload.id === "string" ? payload.id : undefined,
      editorUrl:
        typeof payload.editorUrl === "string" ? payload.editorUrl : undefined,
      previewUrl:
        typeof payload.previewUrl === "string" ? payload.previewUrl : undefined,
      sourceFiles: (payload.sourceFiles ?? [])
        .filter((file) => typeof file?.code === "string")
        .map((file) => ({
          name: typeof file.name === "string" ? file.name : "design.tsx",
          code: file.code as string,
        })),
    };

    logDiagnostic("magicpatterns.completed", {
      latencyMs: Date.now() - startedAt,
      designId: design.designId ?? null,
      files: design.sourceFiles.length,
    });

    return design;
  } catch (error) {
    if (error instanceof AppError) throw error;
    const aborted =
      error instanceof Error &&
      (error.name === "AbortError" || error.name === "TimeoutError");
    throw new AppError(
      "MAGIC_PATTERNS_UNAVAILABLE",
      aborted
        ? `magic patterns request timed out after ${timeoutMs()}ms`
        : `magic patterns request failed: ${error instanceof Error ? error.message : "unknown"}`,
    );
  } finally {
    clearTimeout(timer);
  }
}
