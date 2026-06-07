import { NextResponse } from "next/server";
import { adminUnavailable, getAdminSupabase } from "@/lib/admin-api";

export async function POST(request: Request) {
  const supabase = await getAdminSupabase();
  if (!supabase) return adminUnavailable();

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { description, starts_at, rules, ...rest } = body;

  let { error } = await supabase.from("coupons").insert(body);

  if (error && /column/i.test(error.message)) {
    ({ error } = await supabase.from("coupons").insert(rest));
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
