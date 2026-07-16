import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import type { Faq } from "@/types";

export function FaqSection({
  items,
  description,
  defaultOpenIndex,
  tinted = false,
}: {
  items: Faq[];
  description: ReactNode;
  defaultOpenIndex?: number;
  tinted?: boolean;
}) {
  return (
    <section className="section" style={tinted ? { background: "var(--bg-2)", borderBlock: "1px solid var(--line)" } : undefined}>
      <Container>
        <div className="faq">
          <Reveal>
            <Eyebrow>FAQ</Eyebrow>
            <h2>Everything You Need to Know</h2>
            <p>{description}</p>
          </Reveal>
          <Reveal>
            <FaqAccordion items={items} defaultOpenIndex={defaultOpenIndex} />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
