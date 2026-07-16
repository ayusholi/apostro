import type { ReviewRepository } from "@/application/reviews/ports";
import type { Review } from "@/domain/reviews/Review";
import { reviews } from "@/data/reviews";

export class StaticReviewRepository implements ReviewRepository {
  async listAll(): Promise<Review[]> {
    return reviews;
  }
}
