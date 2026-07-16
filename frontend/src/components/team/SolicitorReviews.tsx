import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHead } from "@/components/ui/SectionHead";
import { StarRating } from "@/components/ui/StarRating";
import { StateBanner } from "@/components/ui/StateBanner";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import type { Review } from "@/domain/reviews/Review";
import type { RatingStats } from "@/domain/reviews/stats";

export function SolicitorReviews({ reviews, stats }: { reviews: Review[]; stats: RatingStats }) {
  return (
    <section className="section section--tight">
      <Container>
        <SectionHead eyebrow="Reviews" title="What Clients Say" />
        {reviews.length === 0 ? (
          <StateBanner variant="empty" title="No reviews name this solicitor directly yet">
            Read what clients say about the firm as a whole on our <Link href="/reviews">Reviews page</Link>.
          </StateBanner>
        ) : (
          <>
            <div className="solicitor-reviews__summary">
              <StarRating rating={stats.average} showValue />
              <span>
                Based on {stats.count} review{stats.count === 1 ? "" : "s"} that name this solicitor directly
              </span>
            </div>
            <div className="review-grid">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          </>
        )}
      </Container>
    </section>
  );
}
