import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import type { Testimonial } from "@/types";

export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <Reveal as="article" className="t-card">
      <div className="stars">★★★★★</div>
      <p>&quot;{testimonial.quote}&quot;</p>
      <div className="who">
        <Image src={testimonial.image} alt="" width={48} height={48} />
        <div>
          <strong>{testimonial.name}</strong>
          <span>{testimonial.role}</span>
        </div>
      </div>
    </Reveal>
  );
}
