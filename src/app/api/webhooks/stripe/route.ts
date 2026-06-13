import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getStripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/service";
import {
  completePaidStripeOrder,
  fulfillOrderItems,
  normalizeLegacyStripeItems,
  parseLegacyStripeItemsMetadata,
} from "@/lib/fulfill-order";

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const meta = session.metadata ?? {};

    const { data: order } = await supabase
      .from("orders")
      .select("id, status, customer_email, total")
      .eq("stripe_session_id", session.id)
      .maybeSingle();

    if (!order) {
      return NextResponse.json({ received: true });
    }

    if (order.status === "paid") {
      return NextResponse.json({ received: true });
    }

    await supabase
      .from("orders")
      .update({
        status: "paid",
        stripe_payment_intent_id: session.payment_intent as string,
        customer_email: session.customer_details?.email ?? order.customer_email,
        shipping_name: session.customer_details?.name ?? null,
        subtotal: meta.subtotal ? Number(meta.subtotal) : undefined,
        discount_amount: meta.discount ? Number(meta.discount) : 0,
        tax_amount: meta.tax ? Number(meta.tax) : 0,
        coupon_code: meta.coupon_code || null,
        total: session.amount_total ? session.amount_total / 100 : undefined,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    if (meta.coupon_id) {
      const { data: coupon } = await supabase
        .from("coupons")
        .select("usage_count")
        .eq("id", meta.coupon_id)
        .single();

      if (coupon) {
        await supabase
          .from("coupons")
          .update({ usage_count: (coupon.usage_count ?? 0) + 1 })
          .eq("id", meta.coupon_id);
      }
    }

    const { count: existingItemCount } = await supabase
      .from("order_items")
      .select("id", { count: "exact", head: true })
      .eq("order_id", order.id);

    if (existingItemCount && existingItemCount > 0) {
      await completePaidStripeOrder(supabase, order.id);
    } else if (meta.items) {
      const items = normalizeLegacyStripeItems(
        parseLegacyStripeItemsMetadata(meta.items)
      );
      await fulfillOrderItems(supabase, order.id, items);
    }
  }

  return NextResponse.json({ received: true });
}
