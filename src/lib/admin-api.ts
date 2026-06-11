import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { requireAdmin } from "@/lib/supabase/server";

export function adminUnavailable() {
  return NextResponse.json(
    { error: "Supabase is not configured. Add keys to .env.local." },
    { status: 503 }
  );
}

export function adminUnauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function getAdminSupabase() {
  if (!isSupabaseConfigured()) return null;
  const { createClient } = await import("@/lib/supabase/server");
  return createClient();
}

export async function getAuthorizedAdminSupabase() {
  if (!isSupabaseConfigured()) {
    return { supabase: null, error: adminUnavailable() };
  }

  try {
    await requireAdmin();
  } catch {
    return { supabase: null, error: adminUnauthorized() };
  }

  const supabase = await getAdminSupabase();
  if (!supabase) {
    return { supabase: null, error: adminUnavailable() };
  }

  return { supabase, error: null };
}
