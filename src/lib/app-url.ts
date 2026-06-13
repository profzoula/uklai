const INVALID_HOSTS = new Set(["0.0.0.0", "127.0.0.1", "localhost"]);

export function isInvalidAppHost(hostname: string): boolean {
  return INVALID_HOSTS.has(hostname.toLowerCase());
}

function normalizeOrigin(url: string): string | null {
  try {
    const parsed = new URL(url.includes("://") ? url : `https://${url}`);
    if (isInvalidAppHost(parsed.hostname)) return null;
    return parsed.origin;
  } catch {
    return null;
  }
}

/** Public site origin for redirects (never 0.0.0.0). */
export function getPublicAppOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (fromEnv) {
    const normalized = normalizeOrigin(fromEnv);
    if (normalized) return normalized;
  }

  if (typeof window !== "undefined") {
    const normalized = normalizeOrigin(window.location.origin);
    if (normalized) return normalized;
  }

  return "http://localhost:3000";
}

export function resolveRequestOrigin(request: Request): string {
  const requestOrigin = new URL(request.url).origin;
  const normalized = normalizeOrigin(requestOrigin);
  if (normalized) return normalized;
  return getPublicAppOrigin();
}
