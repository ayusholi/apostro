import Link from "next/link";
import { AutoSubmitSelect } from "@/components/ui/AutoSubmitSelect";
import { services } from "@/data/services";
import type { ReviewFilter, ReviewSortOrder } from "@/domain/reviews/query";

const SORT_OPTIONS: { value: ReviewSortOrder; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "highest", label: "Highest rated" },
  { value: "lowest", label: "Lowest rated" },
  { value: "helpful", label: "Most helpful" },
];

/**
 * A native GET <form> — filtering/sorting is just navigating to
 * /reviews?rating=5&source=google&sort=highest, so it's fully SEO-crawlable,
 * bookmarkable, and works with JavaScript disabled via the submit button.
 * AutoSubmitSelect only removes the extra click when JS is available.
 */
export function ReviewsToolbar({ filter, sort }: { filter: ReviewFilter; sort: ReviewSortOrder }) {
  const hasActiveFilter = Boolean(filter.rating || filter.source || filter.serviceSlug);

  return (
    <form className="reviews-toolbar" method="get" action="/reviews" aria-label="Filter and sort reviews">
      <fieldset>
        <legend className="sr-only">Filter reviews</legend>

        <div className="field reviews-toolbar__field">
          <label htmlFor="rt-rating">Rating</label>
          <AutoSubmitSelect id="rt-rating" name="rating" defaultValue={filter.rating ?? ""}>
            <option value="">All ratings</option>
            <option value="5">5 stars</option>
            <option value="4">4 stars</option>
            <option value="3">3 stars</option>
            <option value="2">2 stars</option>
            <option value="1">1 star</option>
          </AutoSubmitSelect>
        </div>

        <div className="field reviews-toolbar__field">
          <label htmlFor="rt-source">Source</label>
          <AutoSubmitSelect id="rt-source" name="source" defaultValue={filter.source ?? ""}>
            <option value="">All sources</option>
            <option value="site">ALLS.law</option>
            <option value="google">Google</option>
          </AutoSubmitSelect>
        </div>

        <div className="field reviews-toolbar__field">
          <label htmlFor="rt-service">Service</label>
          <AutoSubmitSelect id="rt-service" name="service" defaultValue={filter.serviceSlug ?? ""}>
            <option value="">All services</option>
            {services.map((service) => (
              <option key={service.slug} value={service.slug}>
                {service.title}
              </option>
            ))}
          </AutoSubmitSelect>
        </div>
      </fieldset>

      <div className="field reviews-toolbar__field">
        <label htmlFor="rt-sort">Sort by</label>
        <AutoSubmitSelect id="rt-sort" name="sort" defaultValue={sort}>
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </AutoSubmitSelect>
      </div>

      <div className="reviews-toolbar__actions">
        <button type="submit" className="btn btn--gold">
          Apply
        </button>
        {hasActiveFilter && (
          <Link href="/reviews" className="reviews-toolbar__clear">
            Clear filters
          </Link>
        )}
      </div>
    </form>
  );
}
