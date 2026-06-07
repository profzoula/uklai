type CategorySlice = {
  name: string;
  count: number;
};

type Props = {
  categories?: CategorySlice[];
};

const COLORS = [
  "#0046be",
  "#fff200",
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#64748b",
];

export function ProductDistributionChart({ categories = [] }: Props) {
  const total = categories.reduce((sum, c) => sum + c.count, 0);
  const slices =
    total > 0
      ? categories
          .filter((c) => c.count > 0)
          .map((c) => ({
            name: c.name,
            count: c.count,
            percent: Math.round((c.count / total) * 100),
          }))
      : [{ name: "No products", count: 0, percent: 100 }];

  let offset = 0;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;

  return (
    <section
      className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm h-full"
      aria-labelledby="category-chart-heading"
    >
      <h2 id="category-chart-heading" className="text-lg font-bold text-slate-900 mb-6">
        Products by category
      </h2>

      {total === 0 ? (
        <p className="text-sm text-slate-500 text-center py-12">
          No products in your catalog yet. Add products to see distribution.
        </p>
      ) : (
        <div className="flex flex-col items-center">
          <div className="relative w-44 h-44" aria-hidden="true">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="12"
              />
              {slices.map((slice, i) => {
                const dash = (slice.count / total) * circumference;
                const circle = (
                  <circle
                    key={slice.name}
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke={COLORS[i % COLORS.length]}
                    strokeWidth="12"
                    strokeDasharray={`${dash} ${circumference - dash}`}
                    strokeDashoffset={-offset}
                    strokeLinecap="butt"
                  />
                );
                offset += dash;
                return circle;
              })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-slate-900">{total}</span>
              <span className="text-xs text-slate-500">products</span>
            </div>
          </div>

          <ul className="flex flex-col gap-3 mt-6 w-full max-h-36 overflow-y-auto" aria-label="Category breakdown">
            {slices.map((slice, i) => (
              <li
                key={slice.name}
                className="flex items-center justify-between text-sm gap-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    aria-hidden="true"
                  />
                  <span className="text-slate-600 truncate">{slice.name}</span>
                </div>
                <span className="font-semibold text-slate-900 shrink-0">
                  {slice.count}{" "}
                  <span className="text-slate-400 font-normal">
                    ({slice.percent}%)
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
