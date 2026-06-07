const stats = [
  {
    value: "50K+",
    label: "Customers worldwide",
    description: "Trusted by thousands of customers shopping every day.",
  },
  {
    value: "10K+",
    label: "Products Sold",
    description: "Thousands of products we delivered successfully.",
  },
  {
    value: "4.9 ★",
    label: "Average Rating",
    description: "Top rated store with consistent customer reviews.",
  },
];

export function ImpactStats() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
            Our Impact
          </h2>
          <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
            Discover premium products at unbeatable prices curated for quality,
            comfort and style.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="text-center p-8 rounded-2xl bg-gradient-to-br from-primary-light to-white border border-primary-light"
            >
              <p className="text-4xl sm:text-5xl font-bold text-primary">
                {stat.value}
              </p>
              <h3 className="mt-3 font-semibold text-slate-900">
                {stat.label}
              </h3>
              <p className="mt-2 text-sm text-slate-600">{stat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
