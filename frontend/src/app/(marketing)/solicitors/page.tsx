import "@/styles/team.css";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { PageHead } from "@/components/sections/PageHead";
// import { LogoStrip } from "@/components/sections/LogoStrip";
import { TeamGrid } from "@/components/sections/TeamGrid";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { JsonLd } from "@/components/seo/JsonLd";
import { solicitorList, breadcrumbList } from "@/lib/seo/schema";
import { buildMetadata } from "@/lib/seo/metadata";
import { solicitors } from "@/data/team/solicitors";

export const metadata = buildMetadata({
  title: "solicitors",
  description: "Meet the solicitors leading ALLS' practice across every major area of law.",
  path: "/solicitors",
});

const crumbs = [{ label: "Home", href: "/" }, { label: "solicitors" }];

export default function solicitorsPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbList([{ name: "Home", path: "/" }, { name: "solicitors" }]),
          solicitorList(solicitors),
        ]}
      />
      <SiteHeader />
      <main id="main">
        <PageHead
          breadcrumbs={crumbs}
          title="Our"
          emphasis="solicitors"
          description="Meet the solicitors leading our practice across every major area of law."
        />
        {/* <LogoStrip /> */}
        <TeamGrid solicitors={solicitors} />
        <CtaBanner />
      </main>
    </>
  );
}
