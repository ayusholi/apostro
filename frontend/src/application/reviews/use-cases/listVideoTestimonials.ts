import type { VideoTestimonialRepository } from "@/application/reviews/ports";
import type { VideoTestimonial } from "@/domain/reviews/Review";

export function makeListVideoTestimonials(repo: VideoTestimonialRepository) {
  return function listVideoTestimonials(): Promise<VideoTestimonial[]> {
    return repo.listAll();
  };
}
