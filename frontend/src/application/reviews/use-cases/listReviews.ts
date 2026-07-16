import type { ReviewRepository } from "@/application/reviews/ports";
import type { GetReviewsInput, GetReviewsOutput } from "@/application/reviews/dto";
import { queryReviews } from "@/domain/reviews/query";
import { computeRatingStats, computeStatsBySource } from "@/domain/reviews/stats";
import { ReviewsPolicy } from "@/domain/reviews/policy";

export function makeListReviews(repo: ReviewRepository) {
  return async function listReviews(input: GetReviewsInput): Promise<GetReviewsOutput> {
    const all = await repo.listAll();

    const result = queryReviews(all, {
      filter: input.filter,
      sort: input.sort,
      page: input.page,
      pageSize: ReviewsPolicy.pageSize,
    });

    return {
      reviews: result.items,
      page: result.page,
      pageCount: result.pageCount,
      totalMatching: result.total,
      overallStats: computeRatingStats(all),
      statsBySource: computeStatsBySource(all),
    };
  };
}
