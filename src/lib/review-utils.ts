type StarLevel = 1 | 2 | 3 | 4 | 5;

export type ReviewDistribution = Record<StarLevel, number>;

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getReviewDistribution(
  rating: number,
  reviewCount: number,
  seed: string
): ReviewDistribution {
  if (reviewCount === 0) {
    return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  }

  const starLevels: StarLevel[] = [5, 4, 3, 2, 1];
  const seedNum = hashString(seed);

  let weights = starLevels.map((star, index) => {
    const diff = star - rating;
    const base = Math.exp(-(diff * diff) / 1.2);
    const jitter = 0.92 + ((seedNum >> (index * 3)) & 7) / 100;
    return base * jitter;
  });

  const weightSum = weights.reduce((sum, weight) => sum + weight, 0);
  const counts = weights.map((weight) =>
    Math.floor((weight / weightSum) * reviewCount)
  );

  let remainder = reviewCount - counts.reduce((sum, count) => sum + count, 0);
  const allocationOrder = starLevels
    .map((star, index) => ({ index, diff: Math.abs(star - rating) }))
    .sort((a, b) => a.diff - b.diff);

  for (let i = 0; remainder > 0; i++, remainder--) {
    counts[allocationOrder[i % allocationOrder.length].index]++;
  }

  return {
    5: counts[0],
    4: counts[1],
    3: counts[2],
    2: counts[3],
    1: counts[4],
  };
}
