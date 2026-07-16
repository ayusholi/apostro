import { Container } from "@/components/ui/Container";
import { SectionHead } from "@/components/ui/SectionHead";
import { ServiceCard } from "@/components/cards/ServiceCard";
import type { Service } from "@/types";

export function ServicesGrid({ services }: { services: Service[] }) {
  return (
    <section className="section">
      <Container>
        <SectionHead
          center
          eyebrow="Services"
          title="Our Legal Services"
          description="Tailored counsel across every practice area, delivered by attorneys you can trust."
        />
        <div className="services-grid">
          {services.map((service) => (
            <ServiceCard key={service.slug} service={service} />
          ))}
        </div>
      </Container>
    </section>
  );
}
