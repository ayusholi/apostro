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
  // Only service slugs with published detail content receive a static page.
  return Object.keys(serviceDetails).map((slug) => ({ slug }));
}

// Dynamic, per-record metadata: title, description, canonical, and social tags
// all resolve from the requested slug's data.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  const detail = serviceDetails[slug];
  if (!service || !detail) return {};
  return buildMetadata({
    title: service.title,
    description: service.description,
    path: `/services/${slug}`,
  });
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  const detail = serviceDetails[slug];

  if (!service || !detail) notFound();

  // The page only renders for services with a catalog entry and detail content.
  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
    { label: service.title },
  ];

  // PageHead renders the last word emphasised (gold) and the rest in white —
  // derived from the service title rather than hardcoded per-page.
  const titleWords = service.title.split(" ");
  const emphasis = titleWords.at(-1)!;
  const headTitle = titleWords.slice(0, -1).join(" ");

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
            description: service.description,
            path: `/services/${slug}`,
          }),
        ]}
      />
      <SiteHeader />
      <main id="main">
        <PageHead
          breadcrumbs={crumbs}
          title={headTitle}
          emphasis={emphasis}
          description={service.description}
        />
        <LogoStrip />
        <ServiceDetail detail={detail} />
        <CtaBanner />
      </main>
    </>
  );
}
