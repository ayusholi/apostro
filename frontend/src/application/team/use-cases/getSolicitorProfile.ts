import type { SolicitorRepository } from "@/application/team/ports";
import type { PostRepository } from "@/application/blog/ports";
import type { ReviewRepository } from "@/application/reviews/ports";
import type { SolicitorProfile } from "@/application/team/dto";
import { computeRatingStats } from "@/domain/reviews/stats";

/**
 * Cross-references the blog and reviews bounded contexts by slug — a
 * legitimate composition, since it depends only on their ports (interfaces),
 * never a concrete adapter. Wired up in infrastructure/teamContainer.ts.
 */
export function makeGetSolicitorProfile(
  solicitorRepo: SolicitorRepository,
  postRepo: PostRepository,
  reviewRepo: ReviewRepository,
) {
  return async function getSolicitorProfile(slug: string): Promise<SolicitorProfile | null> {
    const [solicitors, posts, reviews] = await Promise.all([
      solicitorRepo.listAll(),
      postRepo.listAll(),
      reviewRepo.listAll(),
    ]);

    const solicitor = solicitors.find((s) => s.slug === slug);
    if (!solicitor) return null;

    const relatedArticles = posts.filter((post) => post.authorSlug === slug);
    const solicitorReviews = reviews.filter((review) => review.solicitorSlug === slug);

    return {
      solicitor,
      relatedArticles,
      reviews: solicitorReviews,
      reviewStats: computeRatingStats(solicitorReviews),
    };
  };
}
