import { StateBanner } from "@/components/ui/StateBanner";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import type { Review } from "@/domain/reviews/Review";

export function ReviewsList({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return (
      <StateBanner variant="empty" title="No reviews match these filters">
        Try clearing a filter or choosing a different rating.
      </StateBanner>
    );
  }

  return (
    <div className="review-grid">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
}
