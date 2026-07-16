import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

/**
 * Served at /robots.txt. Allows all crawlers everywhere (there is no private
 * area yet) and points them at the sitemap + canonical host so they crawl the
 * production origin rather than a preview URL.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
