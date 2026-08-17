import { Container } from "@/components/ui/Container";
import { SectionHead } from "@/components/ui/SectionHead";
import { Reveal } from "@/components/ui/Reveal";
import { CountUp } from "@/components/ui/CountUp";
import { stats } from "@/data/stats";

export function WhyChooseUs() {
  return (
    <section className="section section--tight" style={{ background: "var(--bg-2)", borderBlock: "1px solid var(--line)" }}>
      <Container>
        <SectionHead
          center
          eyebrow="Why Choose Us"
          title="Why Trust Our Firm"
          description="A modern approach to legal services, built around clear advice, personal attention, and practical solutions."
        />
        <div className="why">
          {stats.map((stat) => (
            <Reveal className="stat" key={stat.label}>
              <strong>
                <CountUp target={stat.value} suffix={stat.suffix} />
              </strong>
              <span>{stat.label}</span>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
