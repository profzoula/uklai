/** Only allow same-origin relative redirects after OAuth. */
export function safeAuthRedirect(path: string | null | undefined): string {
  if (path?.startsWith("/") && !path.startsWith("//")) return path;
  return "/";
}

export function getAuthCallbackUrl(nextPath?: string): string {
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const next = safeAuthRedirect(nextPath);
  return `${origin}/auth/callback?next=${encodeURIComponent(next)}`;
}
