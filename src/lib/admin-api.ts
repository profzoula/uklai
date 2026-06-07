import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export function adminUnavailable() {
  return NextResponse.json(
    { error: "Supabase is not configured. Add keys to .env.local." },
    { status: 503 }
  );
}

export async function getAdminSupabase() {
  if (!isSupabaseConfigured()) return null;
  const { createClient } = await import("@/lib/supabase/server");
  return createClient();
}
