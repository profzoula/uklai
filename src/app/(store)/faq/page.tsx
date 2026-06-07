import { StoreInfoPage } from "@/components/store/StoreInfoPage";

export default function FaqPage() {
  return (
    <StoreInfoPage title="FAQs">
      <div className="space-y-6 not-prose">
        <div>
          <h2 className="font-semibold text-slate-900 mb-1">
            How long does shipping take?
          </h2>
          <p className="text-slate-600 text-sm">
            Most orders arrive within 5–10 business days. You&apos;ll receive
            tracking info once your order ships.
          </p>
        </div>
        <div>
          <h2 className="font-semibold text-slate-900 mb-1">
            Is shipping free?
          </h2>
          <p className="text-slate-600 text-sm">
            Yes, standard shipping is free on all orders.
          </p>
        </div>
        <div>
          <h2 className="font-semibold text-slate-900 mb-1">
            How do I track my order?
          </h2>
          <p className="text-slate-600 text-sm">
            After checkout, you&apos;ll receive a confirmation email with
            tracking details when your package ships.
          </p>
        </div>
        <div>
          <h2 className="font-semibold text-slate-900 mb-1">
            What payment methods do you accept?
          </h2>
          <p className="text-slate-600 text-sm">
            We accept all major credit and debit cards through secure Stripe
            checkout.
          </p>
        </div>
      </div>
    </StoreInfoPage>
  );
}
