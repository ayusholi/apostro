import { StarRating } from "@/components/ui/StarRating";
import type { RatingStats } from "@/domain/reviews/stats";
import type { RatingValue } from "@/domain/reviews/Review";

const STAR_ORDER: RatingValue[] = [5, 4, 3, 2, 1];

export function OverallRatingSummary({ stats }: { stats: RatingStats }) {
  return (
    <div className="rating-summary" aria-label="Overall rating summary">
      <div className="rating-summary__headline">
        <span className="rating-summary__average">{stats.count ? stats.average.toFixed(1) : "—"}</span>
        <div>
          <StarRating rating={stats.average} size="lg" />
          <p>Based on {stats.count} review{stats.count === 1 ? "" : "s"}</p>
        </div>
      </div>

      <ul className="rating-summary__bars">
        {STAR_ORDER.map((star) => {
          const count = stats.distribution[star];
          const pct = stats.count ? Math.round((count / stats.count) * 100) : 0;
          return (
            <li key={star}>
              <span className="rating-summary__bar-label">{star} star</span>
              <span className="rating-summary__bar-track" aria-hidden="true">
                <span className="rating-summary__bar-fill" style={{ width: `${pct}%` }} />
              </span>
              <span className="rating-summary__bar-count">{count}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
