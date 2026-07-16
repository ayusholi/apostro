import type { Testimonial } from "@/types";

/**
 * The source template's home-page testimonial variant was replaced by
 * FeaturedReviewsSection (real, filterable/sortable review data — @see
 * src/data/reviews.ts) once the reviews system shipped. This services-page
 * variant is unaffected and still ports the original content verbatim.
 */
export const testimonialsServices: Testimonial[] = [
  {
    quote: "Their team turned a daunting situation into a clear plan.",
    name: "John Deep",
    role: "Our Client",
    image: "/images/person-1.jpg",
  },
  {
    quote: "Sharp strategy, calm presence in court, consistent updates.",
    name: "Anna S.",
    role: "Our Client",
    image: "/images/person-2.jpg",
  },
  {
    quote: "Professional, prepared, and genuinely invested in the outcome.",
    name: "Kaylie Jane",
    role: "Our Client",
    image: "/images/person-3.jpg",
  },
];
