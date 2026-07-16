import type { Solicitor } from "@/domain/team/Solicitor";
import type { Post } from "@/domain/blog/Post";
import type { Review } from "@/domain/reviews/Review";
import type { RatingStats } from "@/domain/reviews/stats";

export type SolicitorProfile = {
  solicitor: Solicitor;
  /** Blog posts this solicitor has authored (@see application/blog). Usually empty — most solicitors don't write. */
  relatedArticles: Post[];
  /** Reviews that name this solicitor specifically (@see application/reviews). Most reviews are firm-level, so this is often a small subset. */
  reviews: Review[];
  reviewStats: RatingStats;
};
