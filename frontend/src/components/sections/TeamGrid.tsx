import { Container } from "@/components/ui/Container";
import { SectionHead } from "@/components/ui/SectionHead";
import { SolicitorCard } from "@/components/team/SolicitorCard";
import type { Solicitor } from "@/domain/team/Solicitor";

/** attorneys.html renders this with no heading at all; the About page passes one. */
export function TeamGrid({
  solicitors,
  heading,
}: {
  solicitors: Solicitor[];
  heading?: { eyebrow: string; title: string; description: string };
}) {
  return (
    <section className="section">
      <Container>
        {heading && (
          <SectionHead center eyebrow={heading.eyebrow} title={heading.title} description={heading.description} />
        )}
        <div className="team-grid">
          {solicitors.map((solicitor) => (
            <SolicitorCard key={solicitor.slug} solicitor={solicitor} />
          ))}
        </div>
      </Container>
    </section>
  );
}
