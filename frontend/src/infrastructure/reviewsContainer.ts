/**
 * Composition root for the reviews feature (mirrors container.ts for
 * booking). To connect Postgres later: implement `ReviewRepository` against
 * Prisma in infrastructure/reviews/postgres/, then swap the two `new Static*`
 * lines below. No use case or component changes required. See /prisma/README.md.
 */
import { StaticReviewRepository } from "./reviews/memory/StaticReviewRepository";
import { StaticVideoTestimonialRepository } from "./reviews/memory/StaticVideoTestimonialRepository";
import { makeListReviews } from "@/application/reviews/use-cases/listReviews";
import { makeListFeaturedReviews } from "@/application/reviews/use-cases/listFeaturedReviews";
import { makeListVideoTestimonials } from "@/application/reviews/use-cases/listVideoTestimonials";

const reviewRepository = new StaticReviewRepository();
const videoTestimonialRepository = new StaticVideoTestimonialRepository();

export const reviewsContainer = {
  listReviews: makeListReviews(reviewRepository),
  listFeaturedReviews: makeListFeaturedReviews(reviewRepository),
  listVideoTestimonials: makeListVideoTestimonials(videoTestimonialRepository),
};
