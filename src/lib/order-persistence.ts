import type { SupabaseClient } from "@supabase/supabase-js";

type PendingOrderInput = {
  userId?: string | null;
  customerEmail?: string | null;
  paymentMethod: "stripe" | "cod";
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  couponCode?: string | null;
  stripeSessionId?: string | null;
};

async function resolveOrderUserId(
  supabase: SupabaseClient,
  userId?: string | null
): Promise<string | null> {
  if (!userId) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  return data ? userId : null;
}

export async function createPendingOrder(
  supabase: SupabaseClient,
  input: PendingOrderInput
): Promise<{ orderId: string } | { error: string }> {
  const userId = await resolveOrderUserId(supabase, input.userId);

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      status: "pending",
      total: input.total,
      customer_email: input.customerEmail ?? null,
      ...(input.stripeSessionId
        ? { stripe_session_id: input.stripeSessionId }
        : {}),
    })
    .select("id")
    .single();

  if (error || !order) {
    return { error: error?.message ?? "Could not create order." };
  }

  await supabase
    .from("orders")
    .update({
      payment_method: input.paymentMethod,
      subtotal: input.subtotal,
      discount_amount: input.discount,
      tax_amount: input.tax,
      coupon_code: input.couponCode ?? null,
    })
    .eq("id", order.id);

  return { orderId: order.id };
}
