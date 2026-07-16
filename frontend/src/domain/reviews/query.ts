import type { RatingValue, Review, ReviewSource } from "@/domain/reviews/Review";

export type ReviewSortOrder = "newest" | "oldest" | "highest" | "lowest" | "helpful";

export type ReviewFilter = {
  rating?: RatingValue;
  source?: ReviewSource;
  serviceSlug?: string;
};

export type ReviewQuery = {
  filter: ReviewFilter;
  sort: ReviewSortOrder;
  page: number;
  pageSize: number;
};

export type ReviewQueryResult = {
  items: Review[];
  total: number;
  page: number;
  pageCount: number;
};

const SORTERS: Record<ReviewSortOrder, (a: Review, b: Review) => number> = {
  newest: (a, b) => b.date.localeCompare(a.date),
  oldest: (a, b) => a.date.localeCompare(b.date),
  highest: (a, b) => b.rating - a.rating || b.date.localeCompare(a.date),
  lowest: (a, b) => a.rating - b.rating || b.date.localeCompare(a.date),
  helpful: (a, b) => b.helpfulCount - a.helpfulCount || b.date.localeCompare(a.date),
};

export function filterReviews(reviews: Review[], filter: ReviewFilter): Review[] {
  return reviews.filter((review) => {
    if (filter.rating && review.rating !== filter.rating) return false;
    if (filter.source && review.source !== filter.source) return false;
    if (filter.serviceSlug && review.serviceSlug !== filter.serviceSlug) return false;
    return true;
  });
}

export function sortReviews(reviews: Review[], sort: ReviewSortOrder): Review[] {
  return [...reviews].sort(SORTERS[sort]);
}

/** Editorially-featured reviews, most recent first — for the homepage, not algorithmically picked. */
export function selectFeatured(reviews: Review[], limit: number): Review[] {
  return reviews
    .filter((review) => review.featured)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);
}

/** Pure filter → sort → paginate pipeline. The one place page-1-of-N math lives. */
export function queryReviews(reviews: Review[], query: ReviewQuery): ReviewQueryResult {
  const filtered = filterReviews(reviews, query.filter);
  const sorted = sortReviews(filtered, query.sort);

  const pageCount = Math.max(1, Math.ceil(sorted.length / query.pageSize));
  const page = Math.min(Math.max(1, query.page), pageCount);
  const start = (page - 1) * query.pageSize;

  return {
    items: sorted.slice(start, start + query.pageSize),
    total: sorted.length,
    page,
    pageCount,
  };
}
