import "@/styles/team.css";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { PageHead } from "@/components/sections/PageHead";
import { LogoStrip } from "@/components/sections/LogoStrip";
import { AboutBlock } from "@/components/sections/AboutBlock";
import { WhyChooseUs } from "@/components/sections/WhyChooseUs";
import { RegulatoryInfoSection } from "@/components/sections/RegulatoryInfoSection";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { TeamGrid } from "@/components/sections/TeamGrid";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbList } from "@/lib/seo/schema";
import { buildMetadata } from "@/lib/seo/metadata";
import { solicitors } from "@/data/team/solicitors";
import { valuesAbout } from "@/data/values";

export const metadata = buildMetadata({
  title: "About Us",
  description: "Learn about ALLS' mission, vision, and the solicitors behind our 25-year track record.",
  path: "/about",
});

const crumbs = [{ label: "Home", href: "/" }, { label: "About Us" }];

export default function AboutPage() {
  return (
    <>
      <JsonLd data={breadcrumbList([{ name: "Home", path: "/" }, { name: "About Us" }])} />
      <SiteHeader />
      <main id="main">
        <PageHead
          breadcrumbs={crumbs}
          title="About"
          emphasis="Us"
          description="Two decades of results-driven advocacy, built on transparent communication and a genuine commitment to every client we represent."
        />
        <LogoStrip />
        <AboutBlock eyebrow="About ALLS" values={valuesAbout} />
        <WhyChooseUs />
        <CtaBanner />
        <TeamGrid
          solicitors={solicitors.slice(0, 4)}
          heading={{
            eyebrow: "Expert Team",
            title: "Experienced Solicitors",
            description: "Meet the solicitors leading our practice across every major area of law.",
          }}
        />
        <RegulatoryInfoSection />
      </main>
    </>
  );
}
