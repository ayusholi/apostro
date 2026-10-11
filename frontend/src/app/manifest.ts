import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

/**
 * Served at /manifest.webmanifest. Makes the site installable and gives
 * Android/Chrome consistent name, colours, and icons — a small PWA/UX signal
 * and part of a complete metadata surface.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.name} | ${siteConfig.tagline}`,
    short_name: siteConfig.name,
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#0c0c0c",
    theme_color: "#0c0c0c",
    lang: siteConfig.htmlLang,
    icons: [
      { src: "/brand/logo.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/brand/logo.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
