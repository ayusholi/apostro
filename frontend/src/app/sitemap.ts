import type { MetadataRoute } from "next";
import { siteConfig, footerLegalNav } from "@/config/site";
import { serviceDetails } from "@/data/services";
import { posts } from "@/data/blog/posts";
import { authors } from "@/data/blog/authors";
import { solicitors } from "@/data/team/solicitors";

/**
 * Served at /sitemap.xml. Enumerates every real, indexable route so crawlers
 * discover them without relying on link-following. Dynamic service detail
 * routes are pulled from the data layer, so the sitemap stays correct as more
 * service detail pages are added. Priorities/frequencies signal relative
 * importance and expected update cadence.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const url = (path: string) => `${siteConfig.url}${path}`;

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: url("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: url("/about"), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: url("/services"), lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: url("/attorneys"), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: url("/cases"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    // Reviews are temporarily disabled; do not advertise the route to crawlers.
    // { url: url("/reviews"), lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: url("/blog"), lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: url("/faq"), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: url("/contact"), lastModified: now, changeFrequency: "yearly", priority: 0.6 },
  ];

  const serviceRoutes: MetadataRoute.Sitemap = Object.keys(serviceDetails).map((slug) => ({
    url: url(`/services/${slug}`),
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  // Legal/compliance pages are genuine public content (not gated, no PII),
  // just low-priority/slow-changing relative to marketing pages.
  const legalRoutes: MetadataRoute.Sitemap = footerLegalNav.map((item) => ({
    url: url(item.href),
    lastModified: now,
    changeFrequency: "yearly",
    priority: 0.3,
  }));

  const articleRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: url(`/blog/${post.slug}`),
    lastModified: post.updatedAt ?? post.publishedAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const authorRoutes: MetadataRoute.Sitemap = authors.map((author) => ({
    url: url(`/blog/author/${author.slug}`),
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.4,
  }));

  const solicitorRoutes: MetadataRoute.Sitemap = solicitors.map((solicitor) => ({
    url: url(`/attorneys/${solicitor.slug}`),
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...serviceRoutes, ...legalRoutes, ...articleRoutes, ...authorRoutes, ...solicitorRoutes];
}
