/** Where a review was collected. Drives the "Google Reviews" section split. */
export type ReviewSource = "site" | "google";

export type RatingValue = 1 | 2 | 3 | 4 | 5;

export type Review = {
  id: string;
  authorName: string;
  authorImage?: string;
  rating: RatingValue;
  title?: string;
  body: string;
  /** Service slug this review relates to, if any (@see src/data/services.ts). */
  serviceSlug?: string;
  /** Solicitor slug this review names, if any (@see src/data/team/solicitors.ts) — most reviews are firm-level and leave this unset. */
  solicitorSlug?: string;
  source: ReviewSource;
  /** ISO 8601 date string (date of the review, not submission). */
  date: string;
  /** Site has independently confirmed this reviewer was a real client. */
  verified: boolean;
  /** How many other visitors marked this review helpful. */
  helpfulCount: number;
  /** Editorially curated for homepage/prominent placement — not derived from rating or recency. */
  featured: boolean;
};

export type VideoTestimonial = {
  id: string;
  authorName: string;
  role: string;
  posterImage: string;
  /**
   * URL of the hosted video (mp4 or embeddable Vimeo/YouTube link). `null`
   * until a real recording is produced — the UI renders these as an honest
   * "coming soon" card rather than a broken player.
   */
  videoUrl: string | null;
  caption: string;
  rating: RatingValue;
};
