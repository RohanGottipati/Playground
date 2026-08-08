import { AppError } from "@/lib/errors/AppError";
import { logDiagnostic } from "@/lib/utils/logger";
import { parseSceneAnalysis } from "./parseResponse";
import { PROMPT_VERSION, retryPrompt, SYSTEM_PROMPT, USER_PROMPT } from "./prompts";
import { AI_SCHEMA_VERSION, type SceneAnalysis } from "./schemas";

const BACKBOARD_URL = "https://app.backboard.io/api/threads/messages";
const DEFAULT_TIMEOUT_MS = 25_000;
const MAX_ATTEMPTS = 3;
const REQUIRED_PROVIDER = "openai";
const REQUIRED_MODEL = "gpt-4o";

export type GenerationStatus = "ai" | "ai_repaired";

export type GenerationMetadata = {
  backboardAssistantId?: string;
  backboardThreadId?: string;
  llmProvider: typeof REQUIRED_PROVIDER;
  modelName: typeof REQUIRED_MODEL;
  latencyMs: number;
  attemptCount: number;
  aiSchemaVersion: string;
  promptVersion: string;
  status: GenerationStatus;
  warnings: string[];
};

export type AnalyzeImageInput = {
  image: Uint8Array;
  fileName: string;
  mimeType: string;
};

export type AnalyzeImageResult = {
  analysis: SceneAnalysis;
  metadata: GenerationMetadata;
};

type ModelChoice = {
  provider: typeof REQUIRED_PROVIDER;
  model: typeof REQUIRED_MODEL;
};

type RawResponse = {
  content: string;
  status?: string;
  threadId?: string;
  assistantId?: string;
  provider?: string;
  model?: string;
};

function configuredModel(): ModelChoice {
  const provider =
    process.env.BACKBOARD_PRIMARY_PROVIDER?.trim() || REQUIRED_PROVIDER;
  const model = process.env.BACKBOARD_PRIMARY_MODEL?.trim() || REQUIRED_MODEL;

  if (provider !== REQUIRED_PROVIDER || model !== REQUIRED_MODEL) {
    throw new AppError(
      "BACKBOARD_CONFIGURATION_ERROR",
      `Backboard must use ${REQUIRED_PROVIDER}/${REQUIRED_MODEL}`,
      { reason: "model_configuration" },
    );
  }

  return { provider: REQUIRED_PROVIDER, model: REQUIRED_MODEL };
}

export function isBackboardConfigured(): boolean {
  return Boolean(process.env.BACKBOARD_API_KEY?.trim());
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function responseMessage(body: unknown): string {
  if (!body || typeof body !== "object") return "";
  const value = body as Record<string, unknown>;
  return (
    asString(value.content) ??
    asString(value.detail) ??
    asString(value.message) ??
    asString(value.error) ??
    ""
  );
}

function classifyBackboardFailure(status: number | undefined, message: string): AppError {
  const normalized = message.toLowerCase();
  const details = { upstreamStatus: status, reason: "provider" };

  if (
    status === 401 ||
    status === 403 ||
    /api key|unauthori[sz]ed|authentication|forbidden/.test(normalized)
  ) {
    return new AppError(
      "BACKBOARD_CONFIGURATION_ERROR",
      "Backboard authentication failed",
      { ...details, reason: "authentication" },
    );
  }

  if (/credit|billing|subscription|balance|payment|auto-reload/.test(normalized)) {
    return new AppError(
      "BACKBOARD_CONFIGURATION_ERROR",
      "Backboard chat billing entitlement is unavailable",
      { ...details, reason: "billing" },
    );
  }

  if (
    /model[^.\n]*(not found|invalid|unsupported|unavailable)/.test(normalized) ||
    ((status === 400 || status === 404 || status === 422) &&
      normalized.includes("model"))
  ) {
    return new AppError(
      "BACKBOARD_CONFIGURATION_ERROR",
      "Backboard GPT-4o configuration is unavailable",
      { ...details, reason: "model" },
    );
  }

  if (status === 429) {
    return new AppError(
      "BACKBOARD_UNAVAILABLE",
      "Backboard rate limit exceeded",
      { ...details, reason: "rate_limit" },
    );
  }

  return new AppError(
    "BACKBOARD_UNAVAILABLE",
    status ? `Backboard request failed (${status})` : "Backboard run failed",
    details,
  );
}

async function readResponseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { message: text.slice(0, 400) };
  }
}

async function sendMessage(
  input: AnalyzeImageInput,
  userPrompt: string,
  choice: ModelChoice,
): Promise<RawResponse> {
  const apiKey = process.env.BACKBOARD_API_KEY?.trim();
  if (!apiKey) {
    throw new AppError(
      "BACKBOARD_CONFIGURATION_ERROR",
      "Backboard API key is missing",
      { reason: "authentication" },
    );
  }

  const timeoutMs = Number(process.env.BACKBOARD_TIMEOUT_MS ?? DEFAULT_TIMEOUT_MS);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const form = new FormData();
  form.append("content", userPrompt);
  form.append("system_prompt", SYSTEM_PROMPT);
  form.append("json_output", "true");
  form.append("stream", "false");
  form.append("llm_provider", choice.provider);
  form.append("model_name", choice.model);
  if (process.env.BACKBOARD_ASSISTANT_ID?.trim()) {
    form.append("assistant_id", process.env.BACKBOARD_ASSISTANT_ID.trim());
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
    const body = await readResponseBody(response);

    if (!response.ok) {
      throw classifyBackboardFailure(response.status, responseMessage(body));
    }

    if (!body || typeof body !== "object") {
      throw new AppError(
        "BACKBOARD_INVALID_RESPONSE",
        "Backboard returned a non-object response",
      );
    }

    const value = body as Record<string, unknown>;
    return {
      content: asString(value.content) ?? "",
      status: asString(value.status),
      threadId: asString(value.thread_id),
      assistantId: asString(value.assistant_id),
      provider: asString(value.model_provider),
      model: asString(value.model_name),
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new AppError("BACKBOARD_TIMEOUT", "Backboard request timed out");
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

function verifyReportedModel(raw: RawResponse, choice: ModelChoice): void {
  if (
    (raw.provider && raw.provider !== choice.provider) ||
    (raw.model && raw.model !== choice.model)
  ) {
    throw new AppError(
      "BACKBOARD_CONFIGURATION_ERROR",
      "Backboard responded from an unexpected model",
      {
        reason: "model",
        reportedProvider: raw.provider,
        reportedModel: raw.model,
      },
    );
  }
}

function toRequestError(error: unknown): AppError {
  if (error instanceof AppError) return error;
  return new AppError(
    "BACKBOARD_UNAVAILABLE",
    error instanceof Error ? error.message : "Backboard request failed",
  );
}

/** Analyze a source image with GPT-4o. No unrelated scene is ever substituted. */
export async function analyzeImage(
  input: AnalyzeImageInput,
): Promise<AnalyzeImageResult> {
  const startedAt = Date.now();
  const choice = configuredModel();
  let lastErrors: string[] = [];
  let lastRetryableError: AppError | undefined;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const prompt = attempt === 1 ? USER_PROMPT : retryPrompt(lastErrors.join("\n"));

    try {
      const raw = await sendMessage(input, prompt, choice);

      if (raw.status && raw.status !== "COMPLETED") {
        throw classifyBackboardFailure(undefined, raw.content || raw.status);
      }

      verifyReportedModel(raw, choice);
      const parsed = parseSceneAnalysis(raw.content);
      if (parsed.ok) {
        return {
          analysis: parsed.analysis,
          metadata: {
            backboardAssistantId: raw.assistantId,
            backboardThreadId: raw.threadId,
            llmProvider: choice.provider,
            modelName: choice.model,
            latencyMs: Date.now() - startedAt,
            attemptCount: attempt,
            aiSchemaVersion: AI_SCHEMA_VERSION,
            promptVersion: PROMPT_VERSION,
            status: attempt === 1 ? "ai" : "ai_repaired",
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

      if (attempt === MAX_ATTEMPTS) {
        throw new AppError(
          "BACKBOARD_INVALID_RESPONSE",
          "Backboard returned invalid scene analysis",
          { issues: parsed.errors.slice(0, 5) },
        );
      }
    } catch (error) {
      const requestError = toRequestError(error);
      logDiagnostic("backboard.request_failed", {
        attempt,
        provider: choice.provider,
        model: choice.model,
        code: requestError.code,
        retryable: requestError.retryable,
        reason:
          requestError.details && typeof requestError.details === "object"
            ? (requestError.details as Record<string, unknown>).reason
            : undefined,
      });

      if (!requestError.retryable || attempt === MAX_ATTEMPTS) {
        throw requestError;
      }

      lastRetryableError = requestError;
      lastErrors = [requestError.message];
    }
  }

  throw (
    lastRetryableError ??
    new AppError("BACKBOARD_INVALID_RESPONSE", "Backboard analysis failed")
  );
}
