import Link from "next/link";
import { ArrowRight, Truck, ShieldCheck, Zap } from "lucide-react";

const HERO_VIDEO = "/media/widgets/slide-2/Slide2.webm";

const perks = [
  { icon: Truck, label: "Free shipping $50+" },
  { icon: ShieldCheck, label: "Secure checkout" },
  { icon: Zap, label: "Deals updated daily" },
];

export function Hero() {
  return (
    <section className="relative border-b border-slate-900/20">
      <div className="relative min-h-[420px] sm:min-h-[520px] lg:min-h-[620px] overflow-hidden">
        <video
          className="hero-video absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          aria-hidden
        >
          <source src={HERO_VIDEO} type="video/webm" />
        </video>

        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/55 to-slate-950/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-slate-950/10" />

        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#fff200] z-10" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center py-10 sm:py-14 lg:py-20">
          <div className="max-w-xl lg:max-w-2xl">
            <span className="inline-block bg-[#fff200] text-[#0046be] text-[10px] sm:text-xs font-extrabold uppercase tracking-wider px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-sm mb-3 sm:mb-5">
              Spring savings event
            </span>

            <h1 className="text-[1.65rem] leading-tight sm:text-4xl md:text-5xl xl:text-[3.25rem] font-extrabold sm:leading-[1.08] tracking-tight text-white">
              Tech &amp; essentials
              <span className="block text-[#fff200] mt-0.5 sm:mt-1">
                at prices you&apos;ll love.
              </span>
            </h1>

            <p className="mt-3 sm:mt-5 text-sm sm:text-lg text-slate-200 max-w-md leading-relaxed">
              Shop thousands of products from top brands. Exclusive online deals
              only at UKLAI.
            </p>

            <div className="mt-5 sm:mt-8 flex flex-wrap gap-2.5 sm:gap-3">
              <Link
                href="/shop?deals=true"
                className="inline-flex items-center justify-center gap-1.5 bg-primary text-white px-5 py-2.5 sm:px-7 sm:py-3.5 rounded-md text-sm sm:text-base font-bold hover:bg-primary-dark transition-colors shadow-lg shadow-black/30"
              >
                Shop top deals
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Link>
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-1.5 border-2 border-white/40 text-white px-5 py-2.5 sm:px-7 sm:py-3.5 rounded-md text-sm sm:text-base font-semibold hover:bg-white/10 transition-colors backdrop-blur-sm"
              >
                Browse all
              </Link>
            </div>

            <ul className="mt-6 sm:mt-10 flex flex-wrap gap-x-4 sm:gap-x-6 gap-y-2 sm:gap-y-3">
              {perks.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-200"
                >
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#fff200] shrink-0" />
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="relative z-10 border-t border-[#fff200]/40 bg-[#fff200]/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 text-center text-xs sm:text-base">
          <p className="text-slate-900 font-medium">
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
