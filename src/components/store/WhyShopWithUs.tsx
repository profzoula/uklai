import { Shield, Truck, CreditCard, RefreshCw } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Premium Quality",
    description:
      "Only top-tier trusted brands ensuring durability, performance, and reliability.",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    description: "All orders processed quickly and shipped within 24 hours.",
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    description:
      "Fully encrypted checkout transactions and accurate information.",
  },
  {
    icon: RefreshCw,
    title: "Easy Returns",
    description:
      "Simple seven-day return policy with no complications or stress.",
  },
];

export function WhyShopWithUs() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
            Why shop with us?
          </h2>
          <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
            Discover premium products at unbeatable prices curated for quality,
            comfort and style.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="text-center p-6 rounded-2xl hover:bg-slate-50 transition-colors"
            >
              <div className="w-14 h-14 bg-primary-light rounded-2xl flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
