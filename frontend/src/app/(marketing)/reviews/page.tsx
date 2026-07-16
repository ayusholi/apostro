import "@/styles/reviews.css";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { PageHead } from "@/components/sections/PageHead";
import { Container } from "@/components/ui/Container";
import { SectionHead } from "@/components/ui/SectionHead";
import { JsonLd } from "@/components/seo/JsonLd";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { OverallRatingSummary } from "@/components/reviews/OverallRatingSummary";
import { GoogleReviewsSection } from "@/components/reviews/GoogleReviewsSection";
import { VideoTestimonials } from "@/components/reviews/VideoTestimonials";
import { ReviewsToolbar } from "@/components/reviews/ReviewsToolbar";
import { ReviewsList } from "@/components/reviews/ReviewsList";
import { Pagination } from "@/components/ui/Pagination";
import { reviewsContainer } from "@/infrastructure/reviewsContainer";
import { breadcrumbList, reviewsPageSchema } from "@/lib/seo/schema";
import { buildMetadata } from "@/lib/seo/metadata";
import { services } from "@/data/services";
import type { RatingValue } from "@/domain/reviews/Review";
import type { ReviewFilter, ReviewSortOrder } from "@/domain/reviews/query";

export const metadata = buildMetadata({
  title: "Reviews",
  description: "Read verified client reviews and Google ratings for ALLS' criminal defence, corporate, and family law teams.",
  path: "/reviews",
});

const VALID_SORTS: ReviewSortOrder[] = ["newest", "oldest", "highest", "lowest", "helpful"];
const crumbs = [{ label: "Home", href: "/" }, { label: "Reviews" }];

function parseRating(raw?: string): RatingValue | undefined {
  const n = Number(raw);
  return n >= 1 && n <= 5 && Number.isInteger(n) ? (n as RatingValue) : undefined;
}

function parseSource(raw?: string): "site" | "google" | undefined {
  return raw === "site" || raw === "google" ? raw : undefined;
}

function parseServiceSlug(raw?: string): string | undefined {
  return raw && services.some((s) => s.slug === raw) ? raw : undefined;
}

function parseSort(raw?: string): ReviewSortOrder {
  return (VALID_SORTS as string[]).includes(raw ?? "") ? (raw as ReviewSortOrder) : "newest";
}

function parsePage(raw?: string): number {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : 1;
}

type SearchParams = { rating?: string; source?: string; service?: string; sort?: string; page?: string };

export default async function ReviewsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const rawParams = await searchParams;

  const filter: ReviewFilter = {
    rating: parseRating(rawParams.rating),
    source: parseSource(rawParams.source),
    serviceSlug: parseServiceSlug(rawParams.service),
  };
  const sort = parseSort(rawParams.sort);
  const page = parsePage(rawParams.page);

  const [{ reviews, page: currentPage, pageCount, totalMatching, overallStats, statsBySource }, googleFeatured, videoTestimonials] =
    await Promise.all([
      reviewsContainer.listReviews({ filter, sort, page }),
      reviewsContainer.listReviews({ filter: { source: "google" }, sort: "helpful", page: 1 }),
      reviewsContainer.listVideoTestimonials(),
    ]);

  // Query string for pagination links — everything except `page`, which Pagination.tsx owns.
  const linkParams = new URLSearchParams();
  if (filter.rating) linkParams.set("rating", String(filter.rating));
  if (filter.source) linkParams.set("source", filter.source);
  if (filter.serviceSlug) linkParams.set("service", filter.serviceSlug);
  if (sort !== "newest") linkParams.set("sort", sort);

  return (
    <>
      <JsonLd
        data={[
          breadcrumbList([{ name: "Home", path: "/" }, { name: "Reviews" }]),
          reviewsPageSchema(reviews, overallStats),
        ]}
      />
      <SiteHeader />
      <main id="main">
        <PageHead
          breadcrumbs={crumbs}
          title="Client"
          emphasis="Reviews"
          description="Real feedback from people we've represented, collected on ALLS.law and Google."
        />

        <section className="section section--tight">
          <Container>
            <OverallRatingSummary stats={overallStats} />
          </Container>
        </section>

        <GoogleReviewsSection googleReviews={googleFeatured.reviews} stats={statsBySource.google} />

        <section className="section">
          <Container>
            <SectionHead
              eyebrow="Video"
              title="Hear It From Our Clients"
              description="Short, unscripted testimonials from people we've represented."
            />
            <VideoTestimonials testimonials={videoTestimonials} />
          </Container>
        </section>

        <section className="section" id="all-reviews">
          <Container>
            <SectionHead
              eyebrow="All Reviews"
              title="Every Review, Unfiltered"
              description={`Showing ${reviews.length} of ${totalMatching} review${totalMatching === 1 ? "" : "s"}.`}
            />
            <ReviewsToolbar filter={filter} sort={sort} />
            <ReviewsList reviews={reviews} />
            <Pagination page={currentPage} pageCount={pageCount} basePath="/reviews" searchParams={linkParams} ariaLabel="Reviews pagination" />
          </Container>
        </section>

        <CtaBanner />
      </main>
    </>
  );
}
