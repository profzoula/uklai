import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json();

  if (!body.customer_email || !body.reason) {
    return NextResponse.json(
      { error: "Email and reason are required." },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("return_requests").insert({
    order_id: body.order_id || null,
    user_id: user?.id ?? null,
    customer_email: body.customer_email,
    order_number: body.order_number || null,
    reason: body.reason,
    items: body.items ?? [],
    status: "pending",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
