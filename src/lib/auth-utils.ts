import { getPublicAppOrigin } from "@/lib/app-url";

/** Only allow same-origin relative redirects after OAuth. */
export function safeAuthRedirect(path: string | null | undefined): string {
  if (path?.startsWith("/") && !path.startsWith("//")) return path;
  return "/";
}

export function getAuthCallbackUrl(nextPath?: string): string {
  const next = safeAuthRedirect(nextPath);
  return `${getPublicAppOrigin()}/auth/callback?next=${encodeURIComponent(next)}`;
}
