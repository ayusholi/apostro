import { SiteHeader } from "@/components/layout/SiteHeader";
import { PageHead } from "@/components/sections/PageHead";
import { Container } from "@/components/ui/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { LegalPageBody } from "@/components/legal/LegalPageBody";
import { breadcrumbList } from "@/lib/seo/schema";
import { buildMetadata } from "@/lib/seo/metadata";
import { cookiePolicySections } from "@/data/legal/cookiePolicy";
import { LEGAL_LAST_UPDATED } from "@/data/legal/shared";

export const metadata = buildMetadata({
  title: "Cookie Policy",
  description: "Which cookies and similar technologies ALLS' website uses, and how to manage your preferences.",
  path: "/legal/cookie-policy",
});

const crumbs = [{ label: "Home", href: "/" }, { label: "Cookie Policy" }];

export default function CookiePolicyPage() {
  return (
    <>
      <JsonLd data={breadcrumbList([{ name: "Home", path: "/" }, { name: "Cookie Policy" }])} />
      <SiteHeader />
      <main id="main">
        <PageHead
          breadcrumbs={crumbs}
          title="Cookie"
          emphasis="Policy"
          description="Which cookies we use, why, and how to change your preferences."
        />
        <section className="section">
          <Container>
            <LegalPageBody sections={cookiePolicySections} lastUpdated={LEGAL_LAST_UPDATED} />
          </Container>
        </section>
      </main>
    </>
  );
}
