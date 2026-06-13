const MONTH_SHORT = new Intl.DateTimeFormat("en-US", { month: "short" });

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/** Format like "Jun 18 - 25" or "Jun 28 - Jul 3". */
export function formatDeliveryDateRange(from: Date, to: Date): string {
  if (from.getMonth() === to.getMonth() && from.getFullYear() === to.getFullYear()) {
    return `${MONTH_SHORT.format(from)} ${from.getDate()} - ${to.getDate()}`;
  }

  return `${MONTH_SHORT.format(from)} ${from.getDate()} - ${MONTH_SHORT.format(to)} ${to.getDate()}`;
}

export function getDeliveryEstimate(minDays = 4, maxDays = 7, from = new Date()) {
  const start = addDays(from, minDays);
  const end = addDays(from, maxDays);

  return {
    minDays,
    maxDays,
    start,
    end,
    label: formatDeliveryDateRange(start, end),
  };
}
