import { Container } from "@/components/ui/Container";
import { SectionHead } from "@/components/ui/SectionHead";
import { StarRating } from "@/components/ui/StarRating";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { siteConfig } from "@/config/site";
import type { Review } from "@/domain/reviews/Review";
import type { RatingStats } from "@/domain/reviews/stats";

const FEATURED_COUNT = 3;

/**
 * A distinct "reviews collected via Google" section, visually separate from
 * the firm's own review list. Not a live Google Places API embed — no API
 * key is configured for this project — so this renders the same seed data
 * filtered to source: "google", clearly labelled as such. Swapping in a real
 * Places API fetch later only touches StaticReviewRepository, not this file.
 */
export function GoogleReviewsSection({ googleReviews, stats }: { googleReviews: Review[]; stats: RatingStats }) {
  const featured = [...googleReviews]
    .sort((a, b) => b.helpfulCount - a.helpfulCount)
    .slice(0, FEATURED_COUNT);

  if (featured.length === 0) return null;

  return (
    <section className="section section--tight google-reviews">
      <Container>
        <div className="google-reviews__panel">
          <div className="google-reviews__head">
            <span className="google-reviews__badge" aria-hidden="true">G</span>
            <div>
              <SectionHead eyebrow="Google Reviews" title="What clients say on Google" />
              <div className="google-reviews__rating">
                <span className="google-reviews__average">{stats.average.toFixed(1)}</span>
                <StarRating rating={stats.average} />
                <span>{stats.count} Google review{stats.count === 1 ? "" : "s"}</span>
              </div>
            </div>
          </div>

          <div className="review-grid review-grid--3">
            {featured.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>

          <a className="google-reviews__link" href={siteConfig.googleReviewsUrl}>
            View all reviews on Google <span className="arrow">↗</span>
          </a>
        </div>
      </Container>
    </section>
  );
}
