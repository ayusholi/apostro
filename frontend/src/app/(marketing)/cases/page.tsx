import { SiteHeader } from "@/components/layout/SiteHeader";
import { PageHead } from "@/components/sections/PageHead";
import { LogoStrip } from "@/components/sections/LogoStrip";
import { CasesGrid } from "@/components/sections/CasesGrid";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbList, caseItemList } from "@/lib/seo/schema";
import { buildMetadata } from "@/lib/seo/metadata";
import { cases } from "@/data/cases";

export const metadata = buildMetadata({
  title: "Cases",
  description: "Recent matters ALLS has closed for clients across practice areas.",
  path: "/cases",
});

const crumbs = [{ label: "Home", href: "/" }, { label: "Cases" }];

export default function CasesPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbList([{ name: "Home", path: "/" }, { name: "Cases" }]),
          caseItemList(cases),
        ]}
      />
      <SiteHeader />
      <main id="main">
        <PageHead
          breadcrumbs={crumbs}
          title="Recent"
          emphasis="Cases"
          description="A snapshot of the matters we have closed for our clients across practice areas."
        />
        <LogoStrip />
        <CasesGrid cases={cases} />
        <CtaBanner />
      </main>
    </>
  );
}
