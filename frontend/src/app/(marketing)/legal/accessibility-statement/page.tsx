import { SiteHeader } from "@/components/layout/SiteHeader";
import { PageHead } from "@/components/sections/PageHead";
import { Container } from "@/components/ui/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { LegalPageBody } from "@/components/legal/LegalPageBody";
import { breadcrumbList } from "@/lib/seo/schema";
import { buildMetadata } from "@/lib/seo/metadata";
import { accessibilityStatementSections } from "@/data/legal/accessibilityStatement";
import { LEGAL_LAST_UPDATED } from "@/data/legal/shared";

export const metadata = buildMetadata({
  title: "Accessibility Statement",
  description: "ALLS' commitment to WCAG 2.2 AA accessibility, what we've done, and how to report a problem.",
  path: "/legal/accessibility-statement",
});

const crumbs = [{ label: "Home", href: "/" }, { label: "Accessibility Statement" }];

export default function AccessibilityStatementPage() {
  return (
    <>
      <JsonLd data={breadcrumbList([{ name: "Home", path: "/" }, { name: "Accessibility Statement" }])} />
      <SiteHeader />
      <main id="main">
        <PageHead
          breadcrumbs={crumbs}
          title="Accessibility"
          emphasis="Statement"
          description="Our commitment to WCAG 2.2 AA, what we've built, and how to report a problem."
        />
        <section className="section">
          <Container>
            <LegalPageBody sections={accessibilityStatementSections} lastUpdated={LEGAL_LAST_UPDATED} />
          </Container>
        </section>
      </main>
    </>
  );
}
