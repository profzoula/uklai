import { NextResponse } from "next/server";
import { getAvailablePaymentMethods } from "@/lib/payment-methods";
import { getStoreSettings } from "@/lib/store-settings";

export async function GET() {
  const settings = await getStoreSettings();
  const methods = getAvailablePaymentMethods(settings.payment);

  return NextResponse.json({
    methods,
    currency: settings.payment.currency,
  });
}
