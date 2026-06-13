"use client";

import { useState } from "react";
import { ChevronDown, CreditCard, Truck, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { getDeliveryEstimate } from "@/lib/delivery-estimate";
import type { AllStoreSettings } from "@/lib/store-settings-types";

type Props = {
  settings: AllStoreSettings;
};

type Panel = {
  id: string;
  title: string;
  icon: typeof CreditCard;
  content: React.ReactNode;
};

export function ProductDetailAccordion({ settings }: Props) {
  const [openId, setOpenId] = useState<string | null>("payment");
  const { payment, shipping } = settings;
  const delivery = getDeliveryEstimate(4, 7);

  const paymentLines = [
    payment.stripe_enabled && "Credit & debit cards (Stripe)",
    payment.affirm_enabled && "Affirm — pay over time",
    payment.afterpay_enabled && "Afterpay — 4 interest-free payments",
    payment.paypal_enabled && "PayPal (coming soon)",
    payment.cod_enabled && "Cash on delivery",
  ].filter(Boolean);

  const panels: Panel[] = [
    {
      id: "payment",
      title: "Payment information",
      icon: CreditCard,
      content: (
        <ul className="space-y-1.5 text-base sm:text-sm text-slate-600">
          {paymentLines.length > 0 ? (
            paymentLines.map((line) => (
              <li key={line as string} className="flex gap-2">
                <span className="text-primary">•</span>
                {line}
              </li>
            ))
          ) : (
            <li>Contact us for payment options.</li>
          )}
          <li className="pt-2 text-sm text-slate-500">
            Currency: {payment.currency}. BNPL options appear at checkout when
            eligible.
          </li>
        </ul>
      ),
    },
    {
      id: "shipping",
      title: "Shipping information",
      icon: Truck,
      content: (
        <ul className="space-y-1.5 text-base sm:text-sm text-slate-600">
          <li>
            Estimated delivery: {delivery.minDays}–{delivery.maxDays} days
            (US)
          </li>
          {shipping.international_shipping && (
            <li>International shipping available</li>
          )}
        </ul>
      ),
    },
    {
      id: "warranty",
      title: "Warranty policy",
      icon: Shield,
      content: (
        <ul className="space-y-1.5 text-base sm:text-sm text-slate-600">
          <li>Manufacturer warranty applies where stated on the product.</li>
          <li>UKLAI supports returns on eligible items within 90 days.</li>
          <li>
            See our{" "}
            <a href="/returns" className="text-primary font-medium hover:underline">
              returns policy
            </a>{" "}
            for full details.
          </li>
        </ul>
      ),
    },
  ];

  return (
    <div className="mt-6 border border-slate-200 rounded-xl divide-y divide-slate-200 overflow-hidden">
      {panels.map(({ id, title, icon: Icon, content }) => {
        const isOpen = openId === id;
        return (
          <div key={id}>
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : id)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
              aria-expanded={isOpen}
            >
              <span className="flex items-center gap-2.5 text-base sm:text-sm font-semibold text-slate-900">
                <Icon className="w-4 h-4 text-slate-500" aria-hidden="true" />
                {title}
              </span>
              <ChevronDown
                className={cn(
                  "w-4 h-4 text-slate-400 transition-transform",
                  isOpen && "rotate-180"
                )}
                aria-hidden="true"
              />
            </button>
            {isOpen && (
              <div className="px-4 pb-4 pt-0 bg-white">{content}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
