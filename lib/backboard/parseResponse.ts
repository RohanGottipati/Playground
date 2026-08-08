import { SceneAnalysisSchema, type SceneAnalysis } from "./schemas";

export type ParseSuccess = { ok: true; analysis: SceneAnalysis };
export type ParseFailure = { ok: false; errors: string[] };
export type ParseResult = ParseSuccess | ParseFailure;

/** Removes markdown fences and prose around the JSON payload. */
export function extractJsonObject(raw: string): string | undefined {
  const withoutFences = raw
    .replace(/```(?:json)?/gi, "")
    .replace(/```/g, "")
    .trim();

  const start = withoutFences.indexOf("{");
  if (start < 0) return undefined;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = start; index < withoutFences.length; index += 1) {
    const char = withoutFences[index];

    if (inString) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === '"') inString = false;
      continue;
    }

    if (char === '"') inString = true;
    else if (char === "{") depth += 1;
    else if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        const candidate = withoutFences.slice(start, index + 1);
        const trailing = withoutFences.slice(index + 1).trim();
        // Trailing prose is tolerated, but trailing JSON is a sign of a bad response.
        if (trailing.startsWith("{")) return undefined;
        return candidate;
      }
    }
  }

  return undefined;
}

/**
 * Parses and validates a raw model response. Never throws: callers use the
 * structured errors to retry with feedback.
 */
export function parseSceneAnalysis(raw: string): ParseResult {
  const json = extractJsonObject(raw);
  if (!json) {
    return { ok: false, errors: ["response did not contain a JSON object"] };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch (error) {
    return {
      ok: false,
      errors: [
        `response was not valid JSON: ${
          error instanceof Error ? error.message : "parse error"
        }`,
      ],
    };
  }

  const result = SceneAnalysisSchema.safeParse(parsed);
  if (!result.success) {
    return {
      ok: false,
      errors: result.error.issues.map(
        (issue) => `${issue.path.join(".") || "root"}: ${issue.message}`,
      ),
    };
  }

  return { ok: true, analysis: result.data };
}
