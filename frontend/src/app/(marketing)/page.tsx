import { SiteHeader } from "@/components/layout/SiteHeader";
import { Hero } from "@/components/sections/Hero";
import { LogoStrip } from "@/components/sections/LogoStrip";
import { AboutBlock } from "@/components/sections/AboutBlock";
import { WhyChooseUs } from "@/components/sections/WhyChooseUs";
import { ServicesGrid } from "@/components/sections/ServicesGrid";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { FaqSection } from "@/components/sections/FaqSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqPage } from "@/lib/seo/schema";
import { buildMetadata } from "@/lib/seo/metadata";
import { services } from "@/data/services";
import { faqs } from "@/data/faqs";
import { valuesHome } from "@/data/values";

// Home canonical is "/"; description uses the ALLS brand name.
export const metadata = buildMetadata({
  title: "Home",
  path: "/",
});

// The 4 FAQs previewed on the homepage are eligible for FAQ rich results too,
// since they're present in the page's visible content.
const homeFaqs = faqs.slice(0, 4);

export default function HomePage() {
  return (
    <>
      <JsonLd data={faqPage(homeFaqs)} />
      <SiteHeader />
      <main id="main">
        {/* Visually-hidden, keyword-rich H1: the homepage's visible hero text
            is a decorative aria-hidden marquee, so without this the page would
            have no H1 for search engines or screen readers. */}
        <h1 className="sr-only">
          ALLS — Reliable Legal Experts &amp; Trusted Legal Counsel in London
        </h1>
        <Hero />
        <LogoStrip />
        <AboutBlock eyebrow="About Us" values={valuesHome} bigTitle="About ALLS" animateBadge />
        <WhyChooseUs />
        <ServicesGrid services={services.slice(0, 3)} />
        <CtaBanner />
        {/* Reviews are temporarily disabled. Restore FeaturedReviewsSection here when approved. */}
        <FaqSection
          items={homeFaqs}
          description="Common questions about our process, fees, and what to expect when working with ALLS."
          defaultOpenIndex={0}
          tinted
        />
      </main>
    </>
  );
}
