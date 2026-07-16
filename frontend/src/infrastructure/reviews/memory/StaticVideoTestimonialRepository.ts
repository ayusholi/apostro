import type { VideoTestimonialRepository } from "@/application/reviews/ports";
import type { VideoTestimonial } from "@/domain/reviews/Review";
import { videoTestimonials } from "@/data/videoTestimonials";

export class StaticVideoTestimonialRepository implements VideoTestimonialRepository {
  async listAll(): Promise<VideoTestimonial[]> {
    return videoTestimonials;
  }
}
