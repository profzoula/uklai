import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getStripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/service";
import {
  sendAdminNewOrderEmail,
  sendOrderConfirmationEmail,
} from "@/lib/email";

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

    await supabase
      .from("orders")
      .update({
        status: "paid",
        stripe_payment_intent_id: session.payment_intent as string,
        customer_email: session.customer_details?.email ?? null,
        shipping_name: session.customer_details?.name ?? null,
        subtotal: meta.subtotal ? Number(meta.subtotal) : undefined,
        discount_amount: meta.discount ? Number(meta.discount) : 0,
        tax_amount: meta.tax ? Number(meta.tax) : 0,
        coupon_code: meta.coupon_code || null,
        total: session.amount_total ? session.amount_total / 100 : undefined,
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_session_id", session.id);

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

    const itemsJson = meta.items;
    if (itemsJson) {
      const { data: order } = await supabase
        .from("orders")
        .select("id, customer_email, total")
        .eq("stripe_session_id", session.id)
        .single();

      if (order) {
        const items = JSON.parse(itemsJson) as Array<{
          productId: string;
          name: string;
          price: number;
          quantity: number;
          image: string | null;
        }>;

        const productIds = items.map((i) => i.productId);
        const { data: products } = await supabase
          .from("products")
          .select("id, stock, product_type, digital_file_url")
          .in("id", productIds);

        const productMap = new Map(
          (products ?? []).map((p) => [p.id, p])
        );

        await supabase.from("order_items").insert(
          items.map((item) => {
            const product = productMap.get(item.productId);
            return {
              order_id: order.id,
              product_id: item.productId,
              product_name: item.name,
              product_image: item.image,
              quantity: item.quantity,
              price: item.price,
              product_type: product?.product_type ?? "physical",
              digital_file_url: product?.digital_file_url ?? null,
            };
          })
        );

        for (const item of items) {
          const product = productMap.get(item.productId);
          if (product && product.product_type !== "digital") {
            await supabase
              .from("products")
              .update({
                stock: Math.max(0, (product.stock ?? 0) - item.quantity),
              })
              .eq("id", item.productId);
          }
        }

        const { data: fullOrder } = await supabase
          .from("orders")
          .select("*, order_items(*)")
          .eq("id", order.id)
          .single();

        if (fullOrder?.customer_email) {
          await sendOrderConfirmationEmail({
            id: fullOrder.id,
            customer_email: fullOrder.customer_email,
            total: Number(fullOrder.total),
            order_items: fullOrder.order_items,
          });
        }

        await sendAdminNewOrderEmail({
          id: order.id,
          total: Number(order.total),
          customer_email: order.customer_email,
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
