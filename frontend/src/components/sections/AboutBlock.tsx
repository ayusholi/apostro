import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import type { ValueItem } from "@/types";

/** Shared by home and About — the About page additionally omits the "bigtitle" heading above the grid. */
export function AboutBlock({
  eyebrow,
  values,
  bigTitle,
}: {
  eyebrow: string;
  values: ValueItem[];
  bigTitle?: string;
}) {
  return (
    <section className="section">
      <Container>
        {bigTitle && <h2 className="bigtitle">{bigTitle}</h2>}
        <div className="about-grid">
          <Reveal className="about-grid__media">
            <Image src="/images/clients-served.jpg" alt="Solicitors reviewing a case file" fill sizes="(max-width: 1024px) 100vw, 50vw" />
            <div className="about-grid__badge">
              <strong>Free</strong>
              <span>Initial Consultation</span>
            </div>
          </Reveal>
          <Reveal>
            <Eyebrow>{eyebrow}</Eyebrow>
            <h2>Delivering Results with Integrity</h2>
            <p>
              A boutique firm built around partner-level attention, combining rigorous legal expertise with genuine
              care for every client, communicating in plain English, keeping you informed at each step, and pursuing
              the outcome that matters most to you.
            </p>
            <div className="value-list">
              {values.map((value) => (
                <div className="v" key={value.title}>
                  <span className="num">{value.number}</span>
                  <div>
                    <h4>{value.title}</h4>
                    <p>{value.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
