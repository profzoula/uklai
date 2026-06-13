import { NextResponse } from "next/server";
import { adminUnavailable, getAdminSupabase } from "@/lib/admin-api";
import type { OrderStatus } from "@/types/database";
import { sendShippedEmail, sendReviewRequestEmail } from "@/lib/email";

const validStatuses: OrderStatus[] = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

type Props = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: Props) {
  const { id } = await params;
  const supabase = await getAdminSupabase();
  if (!supabase) return adminUnavailable();

  const body = await request.json();
  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (body.status) {
    if (!validStatuses.includes(body.status as OrderStatus)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    updates.status = body.status;
  }

  if (body.tracking_number !== undefined) {
    updates.tracking_number = body.tracking_number || null;
  }
  if (body.tracking_carrier !== undefined) {
    updates.tracking_carrier = body.tracking_carrier || null;
  }
  if (body.admin_notes !== undefined) {
    updates.admin_notes = body.admin_notes || null;
  }

  const { data: before } = await supabase
    .from("orders")
    .select("status, customer_email, review_request_sent_at")
    .eq("id", id)
    .single();

  const { error } = await supabase.from("orders").update(updates).eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (
    body.status === "shipped" &&
    before?.status !== "shipped" &&
    before?.customer_email
  ) {
    await sendShippedEmail({
      id,
      customer_email: before.customer_email,
      tracking_number: body.tracking_number,
      tracking_carrier: body.tracking_carrier,
    });
  }

  if (
    body.status === "delivered" &&
    before?.status !== "delivered" &&
    before?.customer_email &&
    !before.review_request_sent_at
  ) {
    await sendReviewRequestEmail(supabase, id);
  }

  return NextResponse.json({ success: true });
}
