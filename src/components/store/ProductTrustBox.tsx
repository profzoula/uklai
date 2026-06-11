import { ShieldCheck, Truck, RotateCcw, BadgeCheck } from "lucide-react";

type Props = {
  freeShippingThreshold?: string;
};

export function ProductTrustBox({
  freeShippingThreshold = "50",
}: Props) {
  const items = [
    {
      icon: BadgeCheck,
      title: "100% Genuine",
      text: "Authentic products from trusted suppliers",
    },
    {
      icon: ShieldCheck,
      title: "Secure checkout",
      text: "Stripe-protected payments & privacy",
    },
    {
      icon: Truck,
      title: "Free delivery",
      text: `On orders over $${freeShippingThreshold}`,
    },
    {
      icon: RotateCcw,
      title: "Easy returns",
      text: "Hassle-free return policy",
    },
  ];

  return (
    <aside className="bg-slate-50 border border-slate-200 rounded-xl p-5 sm:p-6 h-fit">
      <ul className="space-y-5">
        {items.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-light text-primary flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-base sm:text-sm font-bold text-slate-900">{title}</p>
              <p className="text-sm text-slate-500 mt-0.5 leading-relaxed">
                {text}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
