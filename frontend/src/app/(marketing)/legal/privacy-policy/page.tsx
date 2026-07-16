import { SiteHeader } from "@/components/layout/SiteHeader";
import { PageHead } from "@/components/sections/PageHead";
import { Container } from "@/components/ui/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { LegalPageBody } from "@/components/legal/LegalPageBody";
import { breadcrumbList } from "@/lib/seo/schema";
import { buildMetadata } from "@/lib/seo/metadata";
import { privacyPolicySections } from "@/data/legal/privacyPolicy";
import { LEGAL_LAST_UPDATED } from "@/data/legal/shared";

export const metadata = buildMetadata({
  title: "Privacy Policy",
  description: "How ALLS collects, uses, and protects your personal data.",
  path: "/legal/privacy-policy",
});

const crumbs = [{ label: "Home", href: "/" }, { label: "Privacy Policy" }];

export default function PrivacyPolicyPage() {
  return (
    <>
      <JsonLd data={breadcrumbList([{ name: "Home", path: "/" }, { name: "Privacy Policy" }])} />
      <SiteHeader />
      <main id="main">
        <PageHead
          breadcrumbs={crumbs}
          title="Privacy"
          emphasis="Policy"
          description="How we collect, use, and protect your personal data."
        />
        <section className="section">
          <Container>
            <LegalPageBody sections={privacyPolicySections} lastUpdated={LEGAL_LAST_UPDATED} />
          </Container>
        </section>
      </main>
    </>
  );
}
