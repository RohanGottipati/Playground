const REDACTED_KEYS = ["key", "token", "secret", "authorization", "password"];

function redact(payload: Record<string, unknown>): Record<string, unknown> {
  const output: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (REDACTED_KEYS.some((needle) => key.toLowerCase().includes(needle))) {
      output[key] = "[redacted]";
    } else if (typeof value === "string" && value.length > 400) {
      output[key] = `${value.slice(0, 400)}…`;
    } else {
      output[key] = value;
    }
  }
  return output;
}

/** Structured, secret-free diagnostic log. Never pass image bytes or keys. */
export function logDiagnostic(
  event: string,
  payload: Record<string, unknown> = {},
): void {
  console.info(JSON.stringify({ event, ...redact(payload) }));
}

export function logError(
  event: string,
  payload: Record<string, unknown> = {},
): void {
  console.error(JSON.stringify({ event, ...redact(payload) }));
}
