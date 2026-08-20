import "@/styles/team.css";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { JsonLd } from "@/components/seo/JsonLd";
import { SolicitorProfileHero } from "@/components/team/SolicitorProfileHero";
import { SolicitorDetails } from "@/components/team/SolicitorDetails";
import { RelatedArticles } from "@/components/blog/RelatedArticles";
import { teamContainer } from "@/infrastructure/teamContainer";
import { breadcrumbList, solicitorProfileSchema } from "@/lib/seo/schema";
import { buildMetadata } from "@/lib/seo/metadata";

export async function generateStaticParams() {
  const solicitors = await teamContainer.listSolicitors();
  return solicitors.map((solicitor) => ({ slug: solicitor.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const profile = await teamContainer.getSolicitorProfile(slug);
  if (!profile) return {};

  return buildMetadata({
    title: profile.solicitor.name,
    description: profile.solicitor.bio,
    path: `/attorneys/${slug}`,
    images: [{ url: profile.solicitor.image, width: 1200, height: 630, alt: profile.solicitor.name }],
  });
}

export default async function SolicitorProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const profile = await teamContainer.getSolicitorProfile(slug);
  if (!profile) notFound();

  const { solicitor, relatedArticles } = profile;
  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Attorneys", href: "/attorneys" },
    { label: solicitor.name },
  ];

  return (
    <>
      <JsonLd
        data={[
          breadcrumbList([{ name: "Home", path: "/" }, { name: "Attorneys", path: "/attorneys" }, { name: solicitor.name }]),
          solicitorProfileSchema(solicitor),
        ]}
      />
      <SiteHeader />
      <main id="main">
        <SolicitorProfileHero solicitor={solicitor} breadcrumbs={crumbs} />
        <SolicitorDetails solicitor={solicitor} />
        <RelatedArticles posts={relatedArticles} />
        {/* Client reviews are temporarily disabled. Restore SolicitorReviews here when approved. */}
        <CtaBanner />
      </main>
    </>
  );
}
