import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { CountUp } from "@/components/ui/CountUp";
import type { ValueItem } from "@/types";

/**
 * Shared by home and About — but the two source pages genuinely differ:
 * home shows a "bigtitle" heading above the grid and animates the 45K+
 * badge; the About page omits the bigtitle and shows the badge as static
 * text (no data-counter attribute in that source markup). Both are
 * preserved via props rather than unified.
 */
export function AboutBlock({
  eyebrow,
  values,
  bigTitle,
  animateBadge = false,
}: {
  eyebrow: string;
  values: ValueItem[];
  bigTitle?: string;
  animateBadge?: boolean;
}) {
  return (
    <section className="section">
      <Container>
        {bigTitle && <h2 className="bigtitle">{bigTitle}</h2>}
        <div className="about-grid">
          <Reveal className="about-grid__media">
            <Image src="/images/clients-served.jpg" alt="Attorneys reviewing a case file" fill sizes="(max-width: 1024px) 100vw, 50vw" />
            <div className="about-grid__badge">
              <strong>{animateBadge ? <CountUp target={45} suffix="K+" /> : "45K+"}</strong>
              <span>Clients Served</span>
            </div>
          </Reveal>
          <Reveal>
            <Eyebrow>{eyebrow}</Eyebrow>
            <h2>Delivering Results with Integrity</h2>
            <p>
              For over two decades, we&apos;ve combined rigorous legal expertise with genuine care for every client
              — communicating in plain English, keeping you informed at each step, and pursuing the outcome that
              matters most to you.
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
