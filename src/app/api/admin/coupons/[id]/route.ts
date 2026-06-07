import { NextResponse } from "next/server";
import { adminUnavailable, getAdminSupabase } from "@/lib/admin-api";

type Props = { params: Promise<{ id: string }> };

async function deleteFrom(table: string, id: string) {
  const supabase = await getAdminSupabase();
  if (!supabase) return adminUnavailable();
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(_request: Request, { params }: Props) {
  const { id } = await params;
  return deleteFrom("coupons", id);
}

export async function PATCH(request: Request, { params }: Props) {
  const supabase = await getAdminSupabase();
  if (!supabase) return adminUnavailable();

  const { id } = await params;
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { description, starts_at, rules, ...rest } = body;

  let { error } = await supabase.from("coupons").update(body).eq("id", id);

  if (error && /column/i.test(error.message)) {
    ({ error } = await supabase.from("coupons").update(rest).eq("id", id));
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
