import { createClient } from "@/lib/supabase/server";
import { resolveRequestOrigin } from "@/lib/app-url";
import { safeAuthRedirect } from "@/lib/auth-utils";
import { ensureProfileForUser } from "@/lib/profile-sync";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const origin = resolveRequestOrigin(request);
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeAuthRedirect(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      await ensureProfileForUser(data.user);
      return NextResponse.redirect(`${origin}${next}`);
    }

    console.error("auth callback exchange failed:", error?.message);
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth`);
}
