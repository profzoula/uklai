const testimonials = [
  {
    name: "Briar Martin",
    handle: "@neilstellar",
    text: "Great selection and fast delivery. UKLAI is now my go-to for online shopping.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
  },
  {
    name: "Alex Chen",
    handle: "@alexchen",
    text: "Amazing quality products and fast shipping. Will definitely shop again!",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
  },
  {
    name: "Sarah Johnson",
    handle: "@sarahj",
    text: "Best online shopping experience I've had. Great prices and customer service.",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
  },
];

export function Testimonials() {
  const doubled = [...testimonials, ...testimonials, ...testimonials, ...testimonials];

  return (
    <section className="py-20 bg-slate-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
            What our customers say
          </h2>
          <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
            Discover premium products at unbeatable prices curated for quality,
            comfort and style.
          </p>
        </div>
      </div>

      <div className="relative">
        <div className="flex animate-marquee gap-6 w-max">
          {doubled.map((t, i) => (
            <div
              key={i}
              className="w-80 flex-shrink-0 bg-white rounded-2xl border border-slate-200 p-6"
            >
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-slate-900 text-sm">
                    {t.name}
                  </p>
                  <p className="text-slate-400 text-xs">{t.handle}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
