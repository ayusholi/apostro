import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";

export function Hero() {
  return (
    <section className="hero">
      <div className="hero__marquee" aria-hidden="true">
        <span>
          Reliable Legal Experts <i className="dot"></i> Trusted Counsel <i className="dot"></i>
        </span>
        <span>
          Reliable Legal Experts <i className="dot"></i> Trusted Counsel <i className="dot"></i>
        </span>
      </div>
      <div className="hero__statue">
        <Image src="/images/hero-statue.png" alt="Statue of Lady Justice" width={655} height={900} priority />
      </div>
      <Container>
        <div className="hero__split">
          <Reveal as="div" className="item left">
            <p>
              Trusted solicitors serving clients across the UK for over 25 years, from our first call to your final
              resolution — with clear advice and no surprise fees.
            </p>
            <Button href="/book" variant="gold" arrow style={{ marginTop: 18 }}>
              Book a Consultation
            </Button>
          </Reveal>
          <Reveal as="div" className="item right">
            {/* h2 (not h3) so the homepage heading order is h1 → h2 with no
                skipped levels; .hero__split h2 keeps the original 1.5rem size. */}
            <h2>Explore Our Law Practice</h2>
            <p>Six practice areas, one dedicated team.</p>
            <Button href="/services" variant="icon" arrow={false} aria-label="See services" style={{ marginTop: 14 }}>
              ↗
            </Button>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
