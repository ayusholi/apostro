import type { ReviewRepository } from "@/application/reviews/ports";
import type { Review } from "@/domain/reviews/Review";
import { selectFeatured } from "@/domain/reviews/query";

export function makeListFeaturedReviews(repo: ReviewRepository) {
  return async function listFeaturedReviews(limit = 3): Promise<Review[]> {
    const all = await repo.listAll();
    return selectFeatured(all, limit);
  };
}
