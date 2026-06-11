import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseServerLive } from "@/lib/supabase/config";
import { createServiceClient } from "@/lib/supabase/service";

/** Server-side Supabase for catalog, orders, admin reads. Uses service role when anon is missing. */
export async function getDataSupabase(): Promise<SupabaseClient | null> {
  if (!isSupabaseServerLive()) return null;

  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return createServiceClient();
  }

  const { createClient } = await import("@/lib/supabase/server");
  return createClient();
}
