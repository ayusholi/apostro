import { SiteHeader } from "@/components/layout/SiteHeader";
import { PageHead } from "@/components/sections/PageHead";
import { LogoStrip } from "@/components/sections/LogoStrip";
import { ServicesGrid } from "@/components/sections/ServicesGrid";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbList, serviceItemList } from "@/lib/seo/schema";
import { buildMetadata } from "@/lib/seo/metadata";
import { services } from "@/data/services";
import { testimonialsServices } from "@/data/testimonials";

export const metadata = buildMetadata({
  title: "Services",
  description: "A.L.L. Solicitors' practice areas: litigation & dispute resolution, family law, property conveyance, and private client serving East London.",
  path: "/services",
});

const crumbs = [{ label: "Home", href: "/" }, { label: "Services" }];

export default function ServicesPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbList([{ name: "Home", path: "/" }, { name: "Services" }]),
          serviceItemList(services),
        ]}
      />
      <SiteHeader />
      <main id="main">
        <PageHead
          breadcrumbs={crumbs}
          title="Our"
          emphasis="Services"
          description="Full-service legal representation across four core practice areas, delivered with the same rigour and care regardless of the size of your matter."
        />
        <LogoStrip />
        <ServicesGrid services={services} />
        <CtaBanner />
        <TestimonialsSection testimonials={testimonialsServices} />
      </main>
    </>
  );
}
