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
import { fulfillOrderItems } from "@/lib/fulfill-order";
import {
  getStripeCheckoutPaymentMethodTypes,
  stripeCheckoutCurrency,
} from "@/lib/stripe-bnpl";

type CheckoutItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
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
      items,
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
        url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?order_id=${order.id}&method=cod`,
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

    const lineItems = items.map((item) => ({
      price_data: {
        currency,
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    if (totals.discount > 0 && appliedCouponCode) {
      lineItems.push({
        price_data: {
          currency,
          product_data: {
            name: `Discount (${appliedCouponCode})`,
            images: [],
          },
          unit_amount: -Math.round(totals.discount * 100),
        },
        quantity: 1,
      });
    }

    if (totals.shipping > 0) {
      lineItems.push({
        price_data: {
          currency,
          product_data: { name: "Shipping", images: [] },
          unit_amount: Math.round(totals.shipping * 100),
        },
        quantity: 1,
      });
    }

    if (totals.tax > 0 && process.env.STRIPE_TAX_ENABLED !== "true") {
      lineItems.push({
        price_data: {
          currency,
          product_data: {
            name: `Sales tax (${settings.tax.default_rate}%)`,
            images: [],
          },
          unit_amount: Math.round(totals.tax * 100),
        },
        quantity: 1,
      });
    }

    const useStripeTax =
      process.env.STRIPE_TAX_ENABLED === "true" && settings.tax.enabled;

    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
      customer_email: user?.email ?? undefined,
      shipping_address_collection: { allowed_countries: ["US"] },
      payment_method_types: paymentMethodTypes,
      ...(useStripeTax ? { automatic_tax: { enabled: true } } : {}),
      metadata: {
        user_id: user?.id ?? "",
        coupon_code: appliedCouponCode ?? "",
        coupon_id: couponId ?? "",
        subtotal: totals.subtotal.toFixed(2),
        discount: totals.discount.toFixed(2),
        shipping: totals.shipping.toFixed(2),
        tax: totals.tax.toFixed(2),
        items: JSON.stringify(
          items.map((i) => ({
            productId: i.productId,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            image: i.image,
          }))
        ),
      },
    });

    if (isSupabaseServerLive() && dataSupabase) {
      await dataSupabase.from("orders").insert({
        user_id: user?.id ?? null,
        stripe_session_id: session.id,
        status: "pending",
        payment_method: "stripe",
        subtotal: totals.subtotal,
        discount_amount: totals.discount,
        tax_amount: totals.tax,
        coupon_code: appliedCouponCode,
        total: useStripeTax && session.amount_total
          ? session.amount_total / 100
          : totals.total,
        customer_email: user?.email ?? null,
      });
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Checkout failed" },
      { status: 500 }
    );
  }
}
