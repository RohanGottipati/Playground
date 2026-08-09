import { AppError } from "@/lib/errors/AppError";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export type RateLimitRule = { limit: number; windowMs: number };

/**
 * In-memory fixed-window limiter. Adequate for a single-process deployment;
 * swap for a Redis limiter if the app is scaled horizontally.
 */
export function checkRateLimit(key: string, rule: RateLimitRule): void {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + rule.windowMs });
    return;
  }

  bucket.count += 1;
  if (bucket.count > rule.limit) {
    throw new AppError("RATE_LIMITED", `rate limit exceeded for ${key}`);
  }
}

export const RATE_LIMITS = {
  upload: { limit: 12, windowMs: 60_000 },
  generate: { limit: 12, windowMs: 60_000 },
  publish: { limit: 10, windowMs: 60_000 },
  events: { limit: 240, windowMs: 60_000 },
  likes: { limit: 30, windowMs: 60_000 },
  telemetryRead: { limit: 60, windowMs: 60_000 },
} satisfies Record<string, RateLimitRule>;

export function extractClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for") ?? "";
  return forwarded.split(",")[0].trim() || "local";
}

export function clientKey(request: Request, scope: string): string {
  return `${scope}:${extractClientIp(request)}`;
}

/** Exposed for tests. */
export function resetRateLimits(): void {
  buckets.clear();
}
