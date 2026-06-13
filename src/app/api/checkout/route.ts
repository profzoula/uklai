import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { getDataSupabase } from "@/lib/supabase/server-data";
import { validateCheckoutItems } from "@/lib/checkout-validate";
import { validateCouponForCart } from "@/lib/coupons";
import type { Coupon } from "@/lib/admin-data-types";
import { getStoreSettings } from "@/lib/store-settings";
import { calculateCheckoutTotals } from "@/lib/checkout-totals";
import { isSupabaseServerLive } from "@/lib/supabase/config";
import { resolveCheckoutPaymentMethod } from "@/lib/payment-methods";
import { fulfillOrderItems, persistOrderItemRows } from "@/lib/fulfill-order";
import {
  getStripeCheckoutPaymentMethodTypes,
  stripeCheckoutCurrency,
} from "@/lib/stripe-bnpl";
import { buildStripeCheckoutLineItems } from "@/lib/checkout-stripe-line-items";
import { resolveRequestOrigin } from "@/lib/app-url";
import Stripe from "stripe";

type CheckoutItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
  freeShipping?: boolean;
  noShippingRequired?: boolean;
  weight?: number | null;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      items: CheckoutItem[];
      couponCode?: string;
      paymentMethod?: string;
      customerEmail?: string;
    };
    const { items: rawItems, couponCode, paymentMethod, customerEmail } = body;
    const appOrigin = resolveRequestOrigin(request);

    if (!rawItems?.length) {
      return NextResponse.json({ error: "No items" }, { status: 400 });
    }

    const settings = await getStoreSettings();
    const method = resolveCheckoutPaymentMethod(settings, paymentMethod);

    if (!method) {
      return NextResponse.json(
        { error: "No payment methods are enabled. Check Admin → Settings → Payment." },
        { status: 400 }
      );
    }

    const dataSupabase = await getDataSupabase();
    let items: CheckoutItem[] = rawItems;

    if (dataSupabase) {
      const validated = await validateCheckoutItems(dataSupabase, rawItems);
      if ("error" in validated) {
        return NextResponse.json({ error: validated.error }, { status: 400 });
      }
      items = validated.items;
    }

    let user = null;
    if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      try {
        const supabase = await createClient();
        const { data } = await supabase.auth.getUser();
        user = data.user;
      } catch {
        // Auth optional for guest checkout
      }
    }

    let discount = 0;
    let appliedCouponCode: string | null = null;
    let couponId: string | null = null;
    let freeShipping = false;

    if (couponCode?.trim() && dataSupabase) {
      const { data: couponRow } = await dataSupabase
        .from("coupons")
        .select("*")
        .ilike("code", couponCode.trim())
        .maybeSingle();

      if (!couponRow) {
        return NextResponse.json({ error: "Invalid coupon code." }, { status: 400 });
      }

      const result = validateCouponForCart(
        couponRow as Coupon,
        items,
        user?.email
      );

      if (!result.valid) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      discount = result.discount;
      appliedCouponCode = result.code;
      couponId = result.couponId;
      freeShipping = result.freeShipping;
    }

    const totals = calculateCheckoutTotals(
      items.map((item) => ({
        productId: item.productId,
        price: item.price,
        quantity: item.quantity,
        freeShipping: item.freeShipping,
        noShippingRequired: item.noShippingRequired,
        weight: item.weight,
      })),
      settings,
      discount,
      freeShipping
    );

    if (method === "cod") {
      if (!dataSupabase) {
        return NextResponse.json(
          { error: "Cash on delivery requires database configuration." },
          { status: 500 }
        );
      }

      const email = customerEmail?.trim() || user?.email || null;
      const { data: order, error: orderError } = await dataSupabase
        .from("orders")
        .insert({
          user_id: user?.id ?? null,
          status: "pending",
          payment_method: "cod",
          subtotal: totals.subtotal,
          discount_amount: totals.discount,
          tax_amount: totals.tax,
          coupon_code: appliedCouponCode,
          total: totals.total,
          customer_email: email,
        })
        .select("id")
        .single();

      if (orderError || !order) {
        return NextResponse.json(
          { error: "Could not place cash on delivery order." },
          { status: 500 }
        );
      }

      if (couponId) {
        const { data: coupon } = await dataSupabase
          .from("coupons")
          .select("usage_count")
          .eq("id", couponId)
          .single();

        if (coupon) {
          await dataSupabase
            .from("coupons")
            .update({ usage_count: (coupon.usage_count ?? 0) + 1 })
            .eq("id", couponId);
        }
      }

      await fulfillOrderItems(dataSupabase, order.id, items);

      return NextResponse.json({
        url: `${appOrigin}/checkout/success?order_id=${order.id}&method=cod`,
      });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe not configured. Add STRIPE_SECRET_KEY to your environment." },
        { status: 500 }
      );
    }

    const currency = stripeCheckoutCurrency(settings.payment.currency);
    const paymentMethodTypes = getStripeCheckoutPaymentMethodTypes(
      settings.payment
    );

    const useStripeTax =
      process.env.STRIPE_TAX_ENABLED === "true" && settings.tax.enabled;

    const lineItems = buildStripeCheckoutLineItems(
      items,
      currency,
      totals.discount,
      totals.shipping,
      totals.tax,
      `Sales tax (${settings.tax.default_rate}%)`,
      !useStripeTax,
      appOrigin
    );

    let orderId: string | undefined;

    if (isSupabaseServerLive() && dataSupabase) {
      const { data: order, error: orderError } = await dataSupabase
        .from("orders")
        .insert({
          user_id: user?.id ?? null,
          status: "pending",
          payment_method: "stripe",
          subtotal: totals.subtotal,
          discount_amount: totals.discount,
          tax_amount: totals.tax,
          coupon_code: appliedCouponCode,
          total: totals.total,
          customer_email: user?.email ?? null,
        })
        .select("id")
        .single();

      if (orderError || !order) {
        return NextResponse.json(
          { error: "Could not create order before checkout." },
          { status: 500 }
        );
      }

      const { error: itemsError } = await persistOrderItemRows(
        dataSupabase,
        order.id,
        items
      );

      if (itemsError) {
        await dataSupabase.from("orders").delete().eq("id", order.id);
        return NextResponse.json(
          { error: "Could not save order items before checkout." },
          { status: 500 }
        );
      }

      orderId = order.id;
    }

    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${appOrigin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appOrigin}/cart`,
      customer_email: user?.email ?? undefined,
      shipping_address_collection: { allowed_countries: ["US"] },
      payment_method_types: paymentMethodTypes,
      ...(useStripeTax ? { automatic_tax: { enabled: true } } : {}),
      metadata: {
        user_id: user?.id ?? "",
        order_id: orderId ?? "",
        coupon_code: appliedCouponCode ?? "",
        coupon_id: couponId ?? "",
        subtotal: totals.subtotal.toFixed(2),
        discount: totals.discount.toFixed(2),
        shipping: totals.shipping.toFixed(2),
        tax: totals.tax.toFixed(2),
      },
    });

    if (isSupabaseServerLive() && dataSupabase && orderId) {
      await dataSupabase
        .from("orders")
        .update({
          stripe_session_id: session.id,
          total:
            useStripeTax && session.amount_total
              ? session.amount_total / 100
              : totals.total,
        })
        .eq("id", orderId);
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    const stripeMessage =
      error instanceof Stripe.errors.StripeError
        ? error.message
        : error instanceof Error
          ? error.message
          : null;
    return NextResponse.json(
      { error: stripeMessage ?? "Checkout failed" },
      { status: 500 }
    );
  }
}
