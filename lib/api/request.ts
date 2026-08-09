import { AppError } from "@/lib/errors/AppError";

/**
 * Body readers that fail as client errors.
 *
 * `request.json()` / `request.formData()` throw a bare `SyntaxError` (or a
 * `Content-Type` TypeError) when a body is truncated, empty or not the declared
 * type. Left unhandled those become UNKNOWN_ERROR 500s, which is wrong: the
 * request never reached the application. Truncated bodies are routine in
 * practice — `navigator.sendBeacon` on page unload and flaky mobile uploads both
 * produce them — so they must not read as server faults.
 */

/** Reads a body as text, reporting an unreadable one as a 422 instead of a 500. */
export async function readTextBody(request: Request): Promise<string> {
  try {
    return await request.text();
  } catch (error) {
    throw new AppError(
      "SCHEMA_VALIDATION_FAILED",
      `request body could not be read: ${message(error)}`,
    );
  }
}

/** Parses a JSON body, reporting a broken one as a 422 instead of a 500. */
export async function readJsonBody(request: Request): Promise<unknown> {
  return parseJson(await readTextBody(request));
}

/**
 * Parses an already-read JSON body. Used by routes that must measure the raw
 * payload before decoding it.
 */
export function parseJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new AppError(
      "SCHEMA_VALIDATION_FAILED",
      `request body is not valid JSON: ${message(error)}`,
    );
  }
}

/** Reads a multipart body, reporting a broken one as a 400 instead of a 500. */
export async function readFormData(request: Request): Promise<FormData> {
  try {
    return await request.formData();
  } catch (error) {
    throw new AppError(
      "INVALID_IMAGE",
      `expected a multipart form upload: ${message(error)}`,
    );
  }
}

function message(error: unknown): string {
  return error instanceof Error ? error.message : "unknown error";
}
