import { AppError } from "@/lib/errors/AppError";
import { logDiagnostic } from "@/lib/utils/logger";
import { buildFallbackAnalysis } from "./fallbackAnalysis";
import { parseSceneAnalysis } from "./parseResponse";
import { PROMPT_VERSION, retryPrompt, SYSTEM_PROMPT, USER_PROMPT } from "./prompts";
import { AI_SCHEMA_VERSION, type SceneAnalysis } from "./schemas";

const BACKBOARD_URL = "https://app.backboard.io/api/threads/messages";
const DEFAULT_TIMEOUT_MS = 25_000;
const MAX_ATTEMPTS = 3;

export type GenerationStatus = "ai" | "ai_repaired" | "fallback";

export type GenerationMetadata = {
  backboardAssistantId?: string;
  backboardThreadId?: string;
  llmProvider?: string;
  modelName?: string;
  latencyMs: number;
  attemptCount: number;
  aiSchemaVersion: string;
  promptVersion: string;
  status: GenerationStatus;
  fallbackUsed: boolean;
  warnings: string[];
};

export type AnalyzeImageInput = {
  image: Uint8Array;
  fileName: string;
  mimeType: string;
  /** Stable id used to keep the deterministic fallback reproducible. */
  seed: string;
};

export type AnalyzeImageResult = {
  analysis: SceneAnalysis;
  metadata: GenerationMetadata;
};

type ModelChoice = { provider?: string; model?: string };

function primaryModel(): ModelChoice {
  return {
    provider: process.env.BACKBOARD_PRIMARY_PROVIDER,
    model: process.env.BACKBOARD_PRIMARY_MODEL,
  };
}

function fallbackModel(): ModelChoice {
  return {
    provider:
      process.env.BACKBOARD_FALLBACK_PROVIDER ??
      process.env.BACKBOARD_PRIMARY_PROVIDER,
    model:
      process.env.BACKBOARD_FALLBACK_MODEL ?? process.env.BACKBOARD_PRIMARY_MODEL,
  };
}

export function isBackboardConfigured(): boolean {
  return Boolean(process.env.BACKBOARD_API_KEY);
}

type RawResponse = {
  content: string;
  threadId?: string;
  assistantId?: string;
  provider?: string;
  model?: string;
};

async function sendMessage(
  input: AnalyzeImageInput,
  userPrompt: string,
  choice: ModelChoice,
): Promise<RawResponse> {
  const apiKey = process.env.BACKBOARD_API_KEY;
  if (!apiKey) throw new AppError("BACKBOARD_INVALID_RESPONSE", "missing api key");

  const timeoutMs = Number(process.env.BACKBOARD_TIMEOUT_MS ?? DEFAULT_TIMEOUT_MS);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const form = new FormData();
  form.append("content", userPrompt);
  form.append("system_prompt", SYSTEM_PROMPT);
  form.append("json_output", "true");
  form.append("stream", "false");
  if (choice.provider) form.append("llm_provider", choice.provider);
  if (choice.model) form.append("model_name", choice.model);
  if (process.env.BACKBOARD_ASSISTANT_ID) {
    form.append("assistant_id", process.env.BACKBOARD_ASSISTANT_ID);
  }
  form.append(
    "files",
    new Blob([new Uint8Array(input.image)], { type: input.mimeType }),
    input.fileName,
  );

  try {
    const response = await fetch(BACKBOARD_URL, {
      method: "POST",
      headers: { "X-API-Key": apiKey },
      body: form,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new AppError(
        "BACKBOARD_INVALID_RESPONSE",
        `backboard responded ${response.status}`,
      );
    }

    const body = (await response.json()) as Record<string, unknown>;
    const content = typeof body.content === "string" ? body.content : "";
    return {
      content,
      threadId: asString(body.thread_id),
      assistantId: asString(body.assistant_id),
      provider: asString(body.llm_provider) ?? choice.provider,
      model: asString(body.model_name) ?? choice.model,
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new AppError("BACKBOARD_TIMEOUT", "backboard request timed out");
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

/**
 * Runs the vision analysis with at most three attempts, then falls back to a
 * deterministic scene so the creator always receives a playable game.
 */
export async function analyzeImage(
  input: AnalyzeImageInput,
): Promise<AnalyzeImageResult> {
  const startedAt = Date.now();
  const warnings: string[] = [];

  if (!isBackboardConfigured()) {
    warnings.push(
      "Backboard is not configured, so a deterministic sample level was generated.",
    );
    return {
      analysis: buildFallbackAnalysis({ seed: input.seed }),
      metadata: {
        latencyMs: Date.now() - startedAt,
        attemptCount: 0,
        aiSchemaVersion: AI_SCHEMA_VERSION,
        promptVersion: PROMPT_VERSION,
        status: "fallback",
        fallbackUsed: true,
        warnings,
      },
    };
  }

  let attempt = 0;
  let lastErrors: string[] = [];
  let lastRaw: RawResponse | undefined;

  while (attempt < MAX_ATTEMPTS) {
    attempt += 1;
    const choice = attempt >= 3 ? fallbackModel() : primaryModel();
    const prompt = attempt === 1 ? USER_PROMPT : retryPrompt(lastErrors.join("\n"));

    try {
      const raw = await sendMessage(input, prompt, choice);
      lastRaw = raw;
      const parsed = parseSceneAnalysis(raw.content);
      if (parsed.ok) {
        return {
          analysis: parsed.analysis,
          metadata: {
            backboardAssistantId: raw.assistantId,
            backboardThreadId: raw.threadId,
            llmProvider: raw.provider,
            modelName: raw.model,
            latencyMs: Date.now() - startedAt,
            attemptCount: attempt,
            aiSchemaVersion: AI_SCHEMA_VERSION,
            promptVersion: PROMPT_VERSION,
            status: attempt === 1 ? "ai" : "ai_repaired",
            fallbackUsed: false,
            warnings: parsed.analysis.warnings,
          },
        };
      }
      lastErrors = parsed.errors;
      logDiagnostic("backboard.invalid_response", {
        attempt,
        provider: choice.provider,
        model: choice.model,
        issues: parsed.errors.slice(0, 5),
      });
    } catch (error) {
      lastErrors = [error instanceof Error ? error.message : "request failed"];
      logDiagnostic("backboard.request_failed", {
        attempt,
        provider: choice.provider,
        model: choice.model,
        message: lastErrors[0],
      });
    }
  }

  warnings.push(
    "We could not fully analyze this photo, so we created a simplified level.",
  );

  return {
    analysis: buildFallbackAnalysis({ seed: input.seed }),
    metadata: {
      backboardAssistantId: lastRaw?.assistantId,
      backboardThreadId: lastRaw?.threadId,
      llmProvider: lastRaw?.provider ?? primaryModel().provider,
      modelName: lastRaw?.model ?? primaryModel().model,
      latencyMs: Date.now() - startedAt,
      attemptCount: attempt,
      aiSchemaVersion: AI_SCHEMA_VERSION,
      promptVersion: PROMPT_VERSION,
      status: "fallback",
      fallbackUsed: true,
      warnings,
    },
  };
}
