import Link from "next/link";
import { ArrowRight, Truck, ShieldCheck, Zap } from "lucide-react";

const perks = [
  { icon: Truck, label: "Free shipping $50+" },
  { icon: ShieldCheck, label: "Secure checkout" },
  { icon: Zap, label: "Deals updated daily" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-white border-b border-slate-200">
      <div className="h-1.5 bg-[#fff200]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          <div className="lg:col-span-6 xl:col-span-5">
            <span className="inline-block bg-[#fff200] text-[#0046be] text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-sm mb-5">
              Spring savings event
            </span>

            <h1 className="text-4xl sm:text-5xl xl:text-[3.25rem] font-extrabold leading-[1.08] tracking-tight text-slate-900">
              Tech &amp; essentials
              <span className="block text-primary mt-1">
                at prices you&apos;ll love.
              </span>
            </h1>

            <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-md leading-relaxed">
              Shop thousands of products from top brands. Exclusive online deals
              only at Briclix.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/shop?deals=true"
                className="inline-flex items-center gap-2 bg-primary text-white px-7 py-3.5 rounded-md font-bold hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20"
              >
                Shop top deals
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 border-2 border-slate-300 text-slate-800 px-7 py-3.5 rounded-md font-semibold hover:bg-slate-50 transition-colors"
              >
                Browse all
              </Link>
            </div>

            <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3">
              {perks.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="flex items-center gap-2 text-sm text-slate-600"
                >
                  <Icon className="w-4 h-4 text-primary shrink-0" />
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-6 xl:col-span-7 relative">
            <div className="grid sm:grid-cols-2 gap-4">
              <Link
                href="/shop?deals=true"
                className="group relative sm:row-span-2 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 hover:border-primary/40 transition-colors min-h-[220px] sm:min-h-0 shadow-sm"
              >
                <img
                  src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80"
                  alt="Headphones deal"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="relative p-5 h-full flex flex-col justify-end text-white">
                  <span className="text-[#fff200] text-xs font-bold uppercase">
                    Up to 40% off
                  </span>
                  <p className="text-xl font-bold mt-1">Audio &amp; tech</p>
                  <span className="inline-flex items-center gap-1 text-sm font-medium mt-2 text-white/90 group-hover:text-white">
                    Shop now <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>

              <Link
                href="/shop?featured=true"
                className="group relative rounded-xl overflow-hidden bg-slate-100 border border-slate-200 hover:border-primary/40 transition-colors min-h-[160px] shadow-sm"
              >
                <img
                  src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80"
                  alt="Featured products"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
                <div className="relative p-4 h-full flex flex-col justify-center text-white">
                  <p className="text-lg font-bold">New arrivals</p>
                  <span className="text-sm text-white/90 group-hover:text-white">
                    See what&apos;s new →
                  </span>
                </div>
              </Link>

              <Link
                href="/shop"
                className="group relative rounded-xl overflow-hidden bg-[#fff200] text-[#0046be] border border-[#fff200] hover:bg-yellow-300 transition-colors min-h-[160px] flex flex-col justify-center p-5 shadow-sm"
              >
                <p className="text-2xl font-extrabold leading-tight">
                  Member picks
                </p>
                <p className="text-sm font-medium mt-1 opacity-80">
                  Curated bestsellers for you
                </p>
                <span className="inline-flex items-center gap-1 text-sm font-bold mt-3">
                  Explore <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 bg-[#fff200]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 text-center text-sm sm:text-base">
          <p className="text-slate-800 font-medium">
            <span className="font-extrabold text-primary">Limited time:</span>{" "}
            Free shipping on orders $50+ · Save up to 40% on select deals ·{" "}
            <Link
              href="/shop?deals=true"
              className="font-bold text-primary underline-offset-2 hover:underline"
            >
              Shop now
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
