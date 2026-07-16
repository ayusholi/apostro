import type { Review, VideoTestimonial } from "@/domain/reviews/Review";

/**
 * Read-only today (static/in-memory data). The interface is shaped so a
 * future Postgres-backed adapter is a drop-in swap — @see prisma/README.md.
 */
export interface ReviewRepository {
  listAll(): Promise<Review[]>;
}

export interface VideoTestimonialRepository {
  listAll(): Promise<VideoTestimonial[]>;
}
