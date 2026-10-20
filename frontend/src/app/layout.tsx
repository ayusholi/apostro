import type { Metadata, Viewport } from "next";
import { fontVariables } from "@/lib/fonts";
import { siteConfig } from "@/config/site";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationGraph } from "@/lib/seo/schema";
import { CookieConsentBanner } from "@/components/legal/CookieConsentBanner";
import "./globals.css";
import "@/styles/legal.css";

export const metadata: Metadata = {
  // Absolute base for every relative canonical / OG / Twitter URL below.
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  category: "Legal Services",
  keywords: [
    "solicitors Stratford",
    "solicitors East London",
    "solicitors Newham",
    "solicitors Hackney",
    "civil litigation and dispute resolution",
    "family law solicitors",
    "property conveyance conveyancing solicitors",
    "wills and probate solicitors",
  ],
  // Default social tags — every content page overrides these via buildMetadata,
  // but this keeps any future route socially shareable out of the box.
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    url: siteConfig.url,
    title: `${siteConfig.name} | ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: `${siteConfig.name} | ${siteConfig.tagline}` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
  // Explicitly grant indexing + rich previews (large image thumbnails, full
  // text snippets) to Google specifically.
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: { canonical: "/" },
  icons: {
    icon: "/brand/logo.png",
    shortcut: "/brand/logo.png",
    apple: "/brand/logo.png",
  },
  manifest: "/manifest.webmanifest",
  formatDetection: { telephone: false, address: false, email: false },
};

export const viewport: Viewport = {
  themeColor: "#0c0c0c",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang={siteConfig.htmlLang} className={fontVariables}>
      <head>
        {/* The hero / page-head background is a CSS background-image, which the
            browser can't discover until it parses CSS. Preloading it lets the
            largest above-the-fold paint start immediately, improving LCP. */}
        <link rel="preload" as="image" href="/images/hero-banner.jpg" fetchPriority="high" />
      </head>
      <body>
        {/* Keyboard/screen-reader users can jump past the header straight to
            content. First focusable element in the DOM. */}
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        {/* Sitewide entity graph: WebSite + Organization + LegalService
            (which covers LocalBusiness by inheritance). Referenced by @id from
            every page-level schema. */}
        <JsonLd data={organizationGraph()} />
        {children}
        <CookieConsentBanner />
      </body>
    </html>
  );
}
