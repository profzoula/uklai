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
    };
    const { items: rawItems, couponCode } = body;

    if (!rawItems?.length) {
      return NextResponse.json({ error: "No items" }, { status: 400 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe not configured. Add STRIPE_SECRET_KEY to .env.local" },
        { status: 500 }
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

    const settings = await getStoreSettings();
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

    const lineItems = items.map((item) => ({
      price_data: {
        currency: "usd",
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
          currency: "usd",
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
          currency: "usd",
          product_data: { name: "Shipping", images: [] },
          unit_amount: Math.round(totals.shipping * 100),
        },
        quantity: 1,
      });
    }

    if (totals.tax > 0 && process.env.STRIPE_TAX_ENABLED !== "true") {
      lineItems.push({
        price_data: {
          currency: "usd",
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
