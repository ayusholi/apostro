import { Container } from "@/components/ui/Container";
import { SectionHead } from "@/components/ui/SectionHead";
import { TestimonialCard } from "@/components/cards/TestimonialCard";
import type { Testimonial } from "@/types";

export function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <section className="section">
      <Container>
        <SectionHead
          center
          eyebrow="Review"
          title="Hear From Our People"
          description="Trusted by 100+ clients who relied on us when the stakes were highest."
        />
        <div className="testimonials">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.name} testimonial={testimonial} />
          ))}
        </div>
      </Container>
    </section>
  );
}
