const FALLBACK_CITY = "Toronto";
const CACHE_TTL_MS = 10 * 60 * 1000;
const LOOKUP_TIMEOUT_MS = 2000;

type CacheEntry = { city: string; expiresAt: number };

const cache = new Map<string, CacheEntry>();

function isLocalOrPrivateIp(ip: string): boolean {
  if (!ip || ip === "local") return true;
  if (ip === "127.0.0.1" || ip === "::1") return true;
  if (ip.startsWith("10.") || ip.startsWith("192.168.") || ip.startsWith("169.254.")) {
    return true;
  }
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(ip)) return true;
  return false;
}

/**
 * City-level IP geolocation via ip-api.com's free endpoint. Never throws:
 * localhost, private ranges, timeouts and failures all fall back to a fixed
 * default city so gameplay telemetry is never blocked on this lookup.
 */
export async function lookupCity(ip: string): Promise<string> {
  if (isLocalOrPrivateIp(ip)) return FALLBACK_CITY;

  const cached = cache.get(ip);
  if (cached && cached.expiresAt > Date.now()) return cached.city;

  try {
    const response = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,city`,
      { signal: AbortSignal.timeout(LOOKUP_TIMEOUT_MS) },
    );
    if (!response.ok) return FALLBACK_CITY;

    const body = (await response.json()) as { status?: string; city?: string };
    const city = body.status === "success" && body.city ? body.city : FALLBACK_CITY;
    cache.set(ip, { city, expiresAt: Date.now() + CACHE_TTL_MS });
    return city;
  } catch (cause) {
    console.warn("ip geolocation lookup failed", cause);
    return FALLBACK_CITY;
  }
}
