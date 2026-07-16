import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { PageHead } from "@/components/sections/PageHead";
import { LogoStrip } from "@/components/sections/LogoStrip";
import { FaqSection } from "@/components/sections/FaqSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbList, faqPage } from "@/lib/seo/schema";
import { buildMetadata } from "@/lib/seo/metadata";
import { faqs } from "@/data/faqs";

export const metadata = buildMetadata({
  title: "FAQ",
  description: "Answers to the questions clients ask most before working with ALLS.",
  path: "/faq",
});

const crumbs = [{ label: "Home", href: "/" }, { label: "FAQ" }];

export default function FaqPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbList([{ name: "Home", path: "/" }, { name: "FAQ" }]),
          faqPage(faqs),
        ]}
      />
      <SiteHeader />
      <main id="main">
        <PageHead
          breadcrumbs={crumbs}
          title="Frequently Asked"
          emphasis="Questions"
          description="Answers to the questions clients ask most before working with us."
        />
        <LogoStrip />
        <FaqSection
          items={faqs}
          description={
            <>
              Can&apos;t find what you&apos;re looking for? <Link href="/contact" style={{ color: "var(--gold)" }}>Get in touch</Link>.
            </>
          }
        />
      </main>
    </>
  );
}
