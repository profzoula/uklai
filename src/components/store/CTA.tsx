import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="py-20 bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white">
          Ready to upgrade your shopping?
        </h2>
        <Link
          href="/shop"
          className="mt-8 inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary-dark transition-colors shadow-lg"
        >
          Start Shopping Now
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </section>
  );
}
