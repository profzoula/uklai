import Link from "next/link";

type Props = {
  href?: string;
  headline?: string;
  highlight?: string;
  subtext?: string;
  buttonLabel?: string;
};

function MemberCardVisual() {
  return (
    <div
      className="relative w-[130px] h-[84px] sm:w-[150px] sm:h-[96px] shrink-0"
      aria-hidden
    >
      <div className="absolute top-3 left-0 w-[118px] h-[72px] sm:w-[132px] sm:h-[80px] rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 border border-white/15 -rotate-6 shadow-lg" />
      <div className="absolute top-0 left-5 w-[118px] h-[72px] sm:w-[132px] sm:h-[80px] rounded-lg bg-gradient-to-br from-[#003da5] to-[#001f52] border border-[#fff200]/25 rotate-6 shadow-xl flex flex-col justify-between p-3">
        <span className="text-[#fff200] text-[11px] sm:text-xs font-extrabold tracking-wide">
          UKLAI
        </span>
        <div>
          <p className="text-white text-[10px] sm:text-[11px] font-semibold leading-tight">
            Member
          </p>
          <p className="text-white/50 text-[9px]">Rewards</p>
        </div>
      </div>
    </div>
  );
}

export function PromoBanner({
  href = "/shop?deals=true",
  headline = "Shop today and get",
  highlight = "10% off",
  subtext = "your first order when you join UKLAI Member Picks — exclusive deals, early access & free shipping alerts.",
  buttonLabel = "Learn more",
}: Props) {
  return (
    <section className="py-6 sm:py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#0046be] rounded-xl overflow-hidden shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center gap-6 sm:gap-8 px-5 sm:px-8 lg:px-10 py-6 sm:py-8 lg:py-9">
            <MemberCardVisual />

            <div className="flex-1 min-w-0 text-center md:text-left">
              <p className="text-white text-lg sm:text-xl font-bold leading-snug">
                {headline}
              </p>
              <p className="text-[#fff200] text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold leading-none mt-1">
                {highlight}
              </p>
              <p className="mt-3 text-sm sm:text-[15px] text-white/90 leading-relaxed max-w-xl mx-auto md:mx-0">
                {subtext}
              </p>
            </div>

            <div className="shrink-0 flex justify-center md:justify-end">
              <Link
                href={href}
                className="inline-flex items-center justify-center bg-white text-[#0046be] font-bold text-sm sm:text-base px-8 py-3 rounded-md hover:bg-slate-100 transition-colors whitespace-nowrap"
              >
                {buttonLabel}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
