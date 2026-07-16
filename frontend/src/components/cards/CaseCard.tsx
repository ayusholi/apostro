import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import type { CaseStudy } from "@/types";

export function CaseCard({ caseStudy }: { caseStudy: CaseStudy }) {
  return (
    <Reveal as="article" className="case-card">
      <Image src={caseStudy.image} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" />
      <div className="case-card__meta">
        <span className="case-card__tag">{caseStudy.tag}</span>
        <h3>{caseStudy.title}</h3>
      </div>
    </Reveal>
  );
}
