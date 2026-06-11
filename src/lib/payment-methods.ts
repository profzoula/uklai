import type { AllStoreSettings, PaymentSettings } from "@/lib/store-settings-types";

export type PaymentMethodId = "stripe" | "paypal" | "cod";

export type PaymentMethodOption = {
  id: PaymentMethodId;
  label: string;
  description: string;
};

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

export function getAvailablePaymentMethods(
  payment: PaymentSettings
): PaymentMethodOption[] {
  const methods: PaymentMethodOption[] = [];

  if (payment.stripe_enabled && isStripeConfigured()) {
    methods.push({
      id: "stripe",
      label: "Credit / debit card",
      description: "Secure checkout powered by Stripe",
    });
  }

  if (payment.cod_enabled) {
    methods.push({
      id: "cod",
      label: "Cash on delivery",
      description: "Pay when your order is delivered",
    });
  }

  return methods;
}

export function getPaymentProviderStatus(
  payment: PaymentSettings,
  stripeConfigured = isStripeConfigured()
) {
  return {
    stripe: {
      enabled: payment.stripe_enabled,
      configured: stripeConfigured,
      active: payment.stripe_enabled && stripeConfigured,
      needsSetup: payment.stripe_enabled && !stripeConfigured,
    },
    paypal: {
      enabled: payment.paypal_enabled,
      configured: false,
      active: false,
      needsSetup: payment.paypal_enabled,
    },
    cod: {
      enabled: payment.cod_enabled,
      configured: true,
      active: payment.cod_enabled,
      needsSetup: false,
    },
  };
}

export function resolveCheckoutPaymentMethod(
  settings: AllStoreSettings,
  requested?: string
): PaymentMethodId | null {
  const available = getAvailablePaymentMethods(settings.payment);
  if (!available.length) return null;

  if (
    requested &&
    available.some((method) => method.id === requested)
  ) {
    return requested as PaymentMethodId;
  }

  return available[0].id;
}
