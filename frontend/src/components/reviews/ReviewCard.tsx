import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { StarRating } from "@/components/ui/StarRating";
import { getServiceBySlug } from "@/data/services";
import type { Review } from "@/domain/reviews/Review";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function ReviewCard({ review }: { review: Review }) {
  const service = review.serviceSlug ? getServiceBySlug(review.serviceSlug) : undefined;

  return (
    <Reveal as="article" className="review-card">
      <div className="review-card__head">
        <div className="review-card__who">
          {review.authorImage ? (
            <Image src={review.authorImage} alt="" width={44} height={44} />
          ) : (
            <span className="review-card__initials" aria-hidden="true">
              {initials(review.authorName)}
            </span>
          )}
          <div>
            <strong>{review.authorName}</strong>
            <span className="review-card__meta">
              {review.verified && <span className="review-card__verified">Verified client</span>}
              <time dateTime={review.date}>{formatDate(review.date)}</time>
            </span>
          </div>
        </div>
        <span className={`review-card__source review-card__source--${review.source}`}>
          {review.source === "google" ? "Google" : "ALLS.law"}
        </span>
      </div>

      <StarRating rating={review.rating} />

      {review.title && <h3 className="review-card__title">{review.title}</h3>}
      <p>{review.body}</p>

      <div className="review-card__foot">
        {service && <span className="review-card__tag">{service.title}</span>}
        {review.helpfulCount > 0 && (
          <span className="review-card__helpful">{review.helpfulCount} found this helpful</span>
        )}
      </div>
    </Reveal>
  );
}
