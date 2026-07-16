"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { StarRating } from "@/components/ui/StarRating";
import type { VideoTestimonial } from "@/domain/reviews/Review";

function VideoCard({ testimonial, onPlay }: { testimonial: VideoTestimonial; onPlay: () => void }) {
  const playable = Boolean(testimonial.videoUrl);

  return (
    <article className="video-card">
      <button
        type="button"
        className="video-card__thumb"
        onClick={onPlay}
        disabled={!playable}
        aria-label={
          playable
            ? `Play video testimonial from ${testimonial.authorName}`
            : `Video testimonial from ${testimonial.authorName} — coming soon`
        }
      >
        <Image src={testimonial.posterImage} alt="" width={360} height={240} />
        <span className="video-card__play" aria-hidden="true">{playable ? "▶" : "○"}</span>
        {!playable && <span className="video-card__soon">Coming soon</span>}
      </button>
      <StarRating rating={testimonial.rating} />
      <p>&quot;{testimonial.caption}&quot;</p>
      <div className="video-card__who">
        <strong>{testimonial.authorName}</strong>
        <span>{testimonial.role}</span>
      </div>
    </article>
  );
}

export function VideoTestimonials({ testimonials }: { testimonials: VideoTestimonial[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [active, setActive] = useState<VideoTestimonial | null>(null);

  function openVideo(testimonial: VideoTestimonial) {
    if (!testimonial.videoUrl) return;
    setActive(testimonial);
    dialogRef.current?.showModal();
  }

  return (
    <>
      <div className="video-grid">
        {testimonials.map((testimonial) => (
          <VideoCard key={testimonial.id} testimonial={testimonial} onPlay={() => openVideo(testimonial)} />
        ))}
      </div>

      {/* Native <dialog>: Escape-to-close, focus trap, and ::backdrop all come free. */}
      <dialog
        ref={dialogRef}
        className="video-dialog"
        aria-label={active ? `Video testimonial from ${active.authorName}` : "Video testimonial"}
        onClose={() => setActive(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) dialogRef.current?.close();
        }}
      >
        {active?.videoUrl && (
          <div className="video-dialog__inner">
            <button
              type="button"
              className="video-dialog__close"
              onClick={() => dialogRef.current?.close()}
              aria-label="Close video"
            >
              ✕
            </button>
            <video src={active.videoUrl} controls autoPlay />
          </div>
        )}
      </dialog>
    </>
  );
}
