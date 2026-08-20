import { notFound } from "next/navigation";

/**
 * The public reviews page is temporarily disabled while its content is under
 * review. Returning a 404 also prevents direct visits to /reviews from
 * exposing the page after its navigation and sitemap entries were removed.
 */
export default function ReviewsPage() {
  notFound();
}
