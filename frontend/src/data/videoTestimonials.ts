import type { VideoTestimonial } from "@/domain/reviews/Review";

/**
 * `videoUrl: null` for every entry — no real client video has been recorded
 * or licensed yet. VideoTestimonials.tsx renders these as an honest "coming
 * soon" card rather than pointing a <video> tag at a broken or stock URL.
 * Once real footage exists, set videoUrl to a hosted mp4 or an embeddable
 * YouTube/Vimeo URL and the player activates automatically.
 */
export const videoTestimonials: VideoTestimonial[] = [
  {
    id: "v-01",
    authorName: "Amara Chen",
    role: "Corporate client",
    posterImage: "/images/person-4.jpg",
    videoUrl: null,
    caption: "On working with our M&A team ahead of a funding round.",
    rating: 5,
  },
  {
    id: "v-02",
    authorName: "Grace Adeyemi",
    role: "Family law client",
    posterImage: "/images/person-6.jpg",
    videoUrl: null,
    caption: "On navigating a custody arrangement without it turning adversarial.",
    rating: 5,
  },
  {
    id: "v-03",
    authorName: "Elliot Reyes",
    role: "Real estate client",
    posterImage: "/images/person-7.jpg",
    videoUrl: null,
    caption: "On a property purchase that closed without a single chain delay.",
    rating: 4,
  },
];
