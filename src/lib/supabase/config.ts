/** Safe to import from client and server — no next/headers. */
export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/** Server reads/writes when URL + service role (or anon) are set. */
export function isSupabaseServerLive(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY)
  );
}

/** Prefer live DB over demo mock data in production. */
export function useMockDataFallback(): boolean {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") return true;
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "false") return false;
  return process.env.NODE_ENV !== "production";
}
