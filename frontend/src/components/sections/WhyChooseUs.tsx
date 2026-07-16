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
          description="Decades of experience, transparent communication, and a commitment to results clients can measure."
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
