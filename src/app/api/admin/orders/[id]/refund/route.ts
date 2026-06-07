import { NextResponse } from "next/server";
import { adminUnavailable, getAdminSupabase } from "@/lib/admin-api";
import { getStripe } from "@/lib/stripe";

type Props = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, { params }: Props) {
  const { id } = await params;
  const supabase = await getAdminSupabase();
  if (!supabase) return adminUnavailable();

  const body = await request.json().catch(() => ({}));
  const amount =
    body.amount != null ? Number(body.amount) : undefined;

  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (!order.stripe_payment_intent_id) {
    return NextResponse.json(
      { error: "No payment intent for this order." },
      { status: 400 }
    );
  }

  const alreadyRefunded = Number(order.refunded_amount ?? 0);
  const orderTotal = Number(order.total);
  const maxRefundable = orderTotal - alreadyRefunded;

  if (maxRefundable <= 0) {
    return NextResponse.json({ error: "Order already fully refunded." }, { status: 400 });
  }

  const refundAmount = amount ?? maxRefundable;
  if (refundAmount <= 0 || refundAmount > maxRefundable) {
    return NextResponse.json(
      { error: `Refund must be between $0.01 and $${maxRefundable.toFixed(2)}.` },
      { status: 400 }
    );
  }

  try {
    await getStripe().refunds.create({
      payment_intent: order.stripe_payment_intent_id,
      amount: Math.round(refundAmount * 100),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Stripe refund failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const newRefunded = alreadyRefunded + refundAmount;
  const newStatus =
    newRefunded >= orderTotal - 0.01 ? "refunded" : order.status;

  await supabase
    .from("orders")
    .update({
      refunded_amount: newRefunded,
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  return NextResponse.json({
    success: true,
    refunded_amount: newRefunded,
    status: newStatus,
  });
}
