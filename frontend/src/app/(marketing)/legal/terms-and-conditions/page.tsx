import { SiteHeader } from "@/components/layout/SiteHeader";
import { PageHead } from "@/components/sections/PageHead";
import { Container } from "@/components/ui/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { LegalPageBody } from "@/components/legal/LegalPageBody";
import { breadcrumbList } from "@/lib/seo/schema";
import { buildMetadata } from "@/lib/seo/metadata";
import { termsAndConditionsSections } from "@/data/legal/termsAndConditions";
import { LEGAL_LAST_UPDATED } from "@/data/legal/shared";

export const metadata = buildMetadata({
  title: "Terms & Conditions",
  description: "The terms that govern your use of the ALLS website.",
  path: "/legal/terms-and-conditions",
});

const crumbs = [{ label: "Home", href: "/" }, { label: "Terms & Conditions" }];

export default function TermsAndConditionsPage() {
  return (
    <>
      <JsonLd data={breadcrumbList([{ name: "Home", path: "/" }, { name: "Terms & Conditions" }])} />
      <SiteHeader />
      <main id="main">
        <PageHead
          breadcrumbs={crumbs}
          title="Terms &"
          emphasis="Conditions"
          description="The terms that govern your use of this website."
        />
        <section className="section">
          <Container>
            <LegalPageBody sections={termsAndConditionsSections} lastUpdated={LEGAL_LAST_UPDATED} />
          </Container>
        </section>
      </main>
    </>
  );
}
