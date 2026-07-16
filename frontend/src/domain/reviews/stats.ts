import type { RatingValue, Review, ReviewSource } from "@/domain/reviews/Review";

export type RatingStats = {
  count: number;
  /** Rounded to 1 decimal place. 0 when there are no reviews. */
  average: number;
  /** Count of reviews at each star rating, 5 down to 1. */
  distribution: Record<RatingValue, number>;
};

const EMPTY_DISTRIBUTION: Record<RatingValue, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

/** Pure aggregate-rating calculation — independently testable, no IO. */
export function computeRatingStats(reviews: Review[]): RatingStats {
  if (reviews.length === 0) {
    return { count: 0, average: 0, distribution: { ...EMPTY_DISTRIBUTION } };
  }

  const distribution = { ...EMPTY_DISTRIBUTION };
  let total = 0;
  for (const review of reviews) {
    distribution[review.rating] += 1;
    total += review.rating;
  }

  return {
    count: reviews.length,
    average: Math.round((total / reviews.length) * 10) / 10,
    distribution,
  };
}

export function computeStatsBySource(reviews: Review[]): Record<ReviewSource, RatingStats> {
  return {
    site: computeRatingStats(reviews.filter((r) => r.source === "site")),
    google: computeRatingStats(reviews.filter((r) => r.source === "google")),
  };
}
