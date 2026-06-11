import type { PaymentSettings } from "@/lib/store-settings-types";
import type Stripe from "stripe";

/** BNPL + cards for Stripe Checkout (methods must also be enabled in Stripe Dashboard). */
export function getStripeCheckoutPaymentMethodTypes(
  payment: PaymentSettings
): Stripe.Checkout.SessionCreateParams.PaymentMethodType[] {
  const types: Stripe.Checkout.SessionCreateParams.PaymentMethodType[] = [
    "card",
  ];

  if (payment.affirm_enabled) {
    types.push("affirm");
  }
  if (payment.afterpay_enabled) {
    types.push("afterpay_clearpay");
  }

  return types;
}

export function stripeCheckoutCurrency(currency: string): string {
  return currency.trim().toLowerCase() || "usd";
}
