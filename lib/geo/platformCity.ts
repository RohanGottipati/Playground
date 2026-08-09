const MAX_CITY_LENGTH = 100;

/**
 * Vercel supplies an encoded city header derived at the edge. The application
 * never receives, persists, or sends an IP address to a geolocation service.
 */
export function platformCity(request: Request): string | null {
  const encoded = request.headers.get("x-vercel-ip-city");
  if (!encoded) return null;

  let decoded = encoded;
  try {
    decoded = decodeURIComponent(encoded.replace(/\+/g, "%20"));
  } catch {
    // A malformed deployment header should not prevent event recording.
  }

  const sanitized = decoded
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .trim()
    .slice(0, MAX_CITY_LENGTH);
  return sanitized || null;
}
