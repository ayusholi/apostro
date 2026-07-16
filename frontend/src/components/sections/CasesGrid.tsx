import { Container } from "@/components/ui/Container";
import { CaseCard } from "@/components/cards/CaseCard";
import type { CaseStudy } from "@/types";

export function CasesGrid({ cases }: { cases: CaseStudy[] }) {
  return (
    <section className="section">
      <Container>
        <div className="cases-grid">
          {cases.map((caseStudy) => (
            <CaseCard key={caseStudy.slug} caseStudy={caseStudy} />
          ))}
        </div>
      </Container>
    </section>
  );
}
