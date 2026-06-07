import { NextResponse } from "next/server";
import { adminUnavailable, getAdminSupabase } from "@/lib/admin-api";

export async function PATCH(request: Request) {
  const supabase = await getAdminSupabase();
  if (!supabase) return adminUnavailable();

  const { id, status, admin_notes } = await request.json();
  const valid = ["pending", "approved", "rejected", "completed"];

  if (!id || !status || !valid.includes(status)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { error } = await supabase
    .from("return_requests")
    .update({
      status,
      admin_notes: admin_notes ?? undefined,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function POST(request: Request) {
  const supabase = await getAdminSupabase();
  if (!supabase) return adminUnavailable();

  const body = await request.json();

  const { error } = await supabase.from("return_requests").insert({
    order_id: body.order_id || null,
    customer_email: body.customer_email,
    order_number: body.order_number || null,
    reason: body.reason,
    status: "pending",
    items: body.items ?? [],
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
