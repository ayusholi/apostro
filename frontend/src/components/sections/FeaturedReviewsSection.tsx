import { Container } from "@/components/ui/Container";
import { SectionHead } from "@/components/ui/SectionHead";
import { StarRating } from "@/components/ui/StarRating";
import { Button } from "@/components/ui/Button";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import type { Review } from "@/domain/reviews/Review";
import type { RatingStats } from "@/domain/reviews/stats";

/**
 * Homepage counterpart to the full /reviews page — same ReviewCard/StarRating
 * components and the same review data, so a future CMS/Postgres swap behind
 * ReviewRepository updates both places at once instead of drifting apart.
 */
export function FeaturedReviewsSection({ reviews, stats }: { reviews: Review[]; stats: RatingStats }) {
  if (reviews.length === 0) return null;

  return (
    <section className="section">
      <Container>
        <SectionHead
          center
          eyebrow="Reviews"
          title="What Our Clients Say"
          description={
            <span className="featured-reviews__rating">
              <StarRating rating={stats.average} showValue />
              <span>from {stats.count} client review{stats.count === 1 ? "" : "s"}</span>
            </span>
          }
        />
        <div className="review-grid">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
        <div className="featured-reviews__cta">
          <Button href="/reviews" variant="ghost" arrow>
            Read All Reviews
          </Button>
        </div>
      </Container>
    </section>
  );
}
