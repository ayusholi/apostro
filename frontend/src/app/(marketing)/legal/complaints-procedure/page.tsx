import { SiteHeader } from "@/components/layout/SiteHeader";
import { PageHead } from "@/components/sections/PageHead";
import { Container } from "@/components/ui/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { LegalPageBody } from "@/components/legal/LegalPageBody";
import { breadcrumbList } from "@/lib/seo/schema";
import { buildMetadata } from "@/lib/seo/metadata";
import { complaintsProcedureSections } from "@/data/legal/complaintsProcedure";
import { LEGAL_LAST_UPDATED } from "@/data/legal/shared";

export const metadata = buildMetadata({
  title: "Complaints Procedure",
  description: "How to raise a concern with ALLS, our response timeline, and how to escalate to the Legal Ombudsman.",
  path: "/legal/complaints-procedure",
});

const crumbs = [{ label: "Home", href: "/" }, { label: "Complaints Procedure" }];

export default function ComplaintsProcedurePage() {
  return (
    <>
      <JsonLd data={breadcrumbList([{ name: "Home", path: "/" }, { name: "Complaints Procedure" }])} />
      <SiteHeader />
      <main id="main">
        <PageHead
          breadcrumbs={crumbs}
          title="Complaints"
          emphasis="Procedure"
          description="How to raise a concern, what happens next, and how to escalate it."
        />
        <section className="section">
          <Container>
            <LegalPageBody sections={complaintsProcedureSections} lastUpdated={LEGAL_LAST_UPDATED} />
          </Container>
        </section>
      </main>
    </>
  );
}
