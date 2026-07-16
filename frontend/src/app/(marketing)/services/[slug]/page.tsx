import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { PageHead } from "@/components/sections/PageHead";
import { LogoStrip } from "@/components/sections/LogoStrip";
import { ServiceDetail } from "@/components/sections/ServiceDetail";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbList, serviceSchema } from "@/lib/seo/schema";
import { buildMetadata } from "@/lib/seo/metadata";
import { getServiceBySlug, serviceDetails } from "@/data/services";

export function generateStaticParams() {
  // Only "criminal-defense" ships full detail content in the source
  // (single-services.html) — every "Learn More" link across all six service
  // cards points to it verbatim, so no other slug needs a page yet.
  return Object.keys(serviceDetails).map((slug) => ({ slug }));
}

const detailDescription =
  "Focused, evidence-led criminal defence from intake through verdict — protecting your rights at every stage.";

// Dynamic, per-record metadata: title, description, canonical, and social tags
// all resolve from the requested slug's data.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) return {};
  return buildMetadata({
    title: service.title,
    description: detailDescription,
    path: `/services/${slug}`,
  });
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  const detail = serviceDetails[slug];

  if (!service || !detail) notFound();

  // Accurate 3-level trail (Home › Services › Criminal Defence) drives both the
  // visible breadcrumb and the BreadcrumbList schema from one source.
  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
    { label: service.title },
  ];

  return (
    <>
      <JsonLd
        data={[
          breadcrumbList([
            { name: "Home", path: "/" },
            { name: "Services", path: "/services" },
            { name: service.title },
          ]),
          serviceSchema({
            name: service.title,
            description: detailDescription,
            path: `/services/${slug}`,
          }),
        ]}
      />
      <SiteHeader />
      <main id="main">
        <PageHead
          breadcrumbs={crumbs}
          title="Criminal"
          emphasis="Defense"
          description="A focused, evidence-led defense strategy from intake through verdict."
        />
        <LogoStrip />
        <ServiceDetail detail={detail} />
        <CtaBanner />
      </main>
    </>
  );
}
