import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

type OgImage = { url: string; width?: number; height?: number; alt?: string };

type BuildMetadataArgs = {
  /** Page title WITHOUT the brand suffix (the title template appends it). */
  title?: string;
  description?: string;
  /** Site-relative path, e.g. "/about". Drives the canonical + OG url. */
  path: string;
  type?: "website" | "article";
  images?: OgImage[];
  /** ISO date for article-type OG. */
  publishedTime?: string;
};

const defaultOgImage: OgImage = {
  url: siteConfig.ogImage,
  width: 1200,
  height: 630,
  alt: `${siteConfig.name} — ${siteConfig.tagline}`,
};

/**
 * Single source of truth for per-page metadata. Guarantees every page gets:
 * - a self-referencing canonical URL (dedupes trailing-slash / query variants),
 * - complete Open Graph tags (Facebook, LinkedIn, Slack, iMessage previews),
 * - complete Twitter Card tags (summary_large_image).
 *
 * Returns COMPLETE openGraph/twitter objects rather than relying on Next's
 * shallow metadata merge, so a page's social tags are never half-inherited.
 */
export function buildMetadata({
  title,
  description,
  path,
  type = "website",
  images,
  publishedTime,
}: BuildMetadataArgs): Metadata {
  const desc = description ?? siteConfig.description;
  const ogImages = images ?? [defaultOgImage];
  const absoluteTitle = title ? `${title} — ${siteConfig.name}` : `${siteConfig.name} — ${siteConfig.tagline}`;

  return {
    title,
    description: desc,
    alternates: { canonical: path },
    openGraph: {
      title: absoluteTitle,
      description: desc,
      url: path,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type,
      images: ogImages,
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: absoluteTitle,
      description: desc,
      images: ogImages.map((img) => img.url),
    },
  };
}
