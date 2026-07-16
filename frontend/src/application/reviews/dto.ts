import type { RatingStats } from "@/domain/reviews/stats";
import type { Review, ReviewSource, VideoTestimonial } from "@/domain/reviews/Review";
import type { ReviewFilter, ReviewSortOrder } from "@/domain/reviews/query";

export type GetReviewsInput = {
  filter: ReviewFilter;
  sort: ReviewSortOrder;
  page: number;
};

export type GetReviewsOutput = {
  reviews: Review[];
  page: number;
  pageCount: number;
  /** Total reviews matching the current filter (pre-pagination). */
  totalMatching: number;
  /** Stats over ALL reviews, unaffected by the current filter — the page header shouldn't jump around as visitors filter. */
  overallStats: RatingStats;
  statsBySource: Record<ReviewSource, RatingStats>;
};

export type { Review, VideoTestimonial };
