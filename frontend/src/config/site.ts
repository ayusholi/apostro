import type { NavItem } from "@/types";
import { posts } from "@/data/blog/posts";
import { isPublished } from "@/domain/blog/Post";

/** No published articles right now (all unpublished pending originality review) — hide blog nav links until one goes live. */
const hasPublishedArticles = posts.some(isPublished);

export const siteConfig = {
  name: "ALLS",
  /** Full legal entity name for Organization.legalName — @see src/config/legal.ts for the rest of the regulatory detail. */
  legalName: "Assured Legal Limited trading as A.L.L. Solicitors",
  tagline: "Solicitors & Legal Services",
  description:
    "A.L.L. Solicitors (ALLS) is a boutique solicitors' firm based in Stratford, serving individuals and SMEs across East London in civil litigation and dispute resolution, family law, property conveyance, and private client matters.",
  /** Canonical production origin — drives metadataBase, canonicals, sitemap, and schema @ids. */
  url: "https://alls-legal.co.uk",
  /** Default social-share image (1200×630), generated into /public. */
  ogImage: "/og-image.jpg",
  /** BCP-47 tag for <html lang>. UK firm → en-GB. */
  htmlLang: "en-GB",
  /** Open Graph locale (underscore form). */
  locale: "en_GB",

  // Contact — real UK number, confirmed by the client (020 7183 3139). The
  // leading 0 is dropped for the +44 E.164 forms; phone/phoneHref/phoneE164
  // deliberately mirror each other so structured data matches visible content.
  phone: "020 7183 3139",
  phoneHref: "tel:+442071833139",
  phoneE164: "+442071833139",
  email: "info@alls-legal.co.uk",
  emailHref: "mailto:info@alls-legal.co.uk",
  complaintsEmail: "complaints@alls-legal.co.uk",
  address: "20 Store Street, Stratford, London E15 1PU",

  /** Structured postal address for PostalAddress schema (GB conventions). */
  postalAddress: {
    streetAddress: "20 Store Street, London",
    addressLocality: "Stratford",
    addressRegion: "London",
    postalCode: "E15 1PU",
    addressCountry: "GB",
  },
  /** Approximate coordinates for E15 1PU (Stratford) — refine with an exact rooftop geocode when available. */
  geo: { latitude: 51.5413, longitude: -0.0033 },
  areaServed: "Newham and Hackney, East London",
  priceRange: "££",
  /** Two Directors/Solicitors today — a boutique firm, not the inherited template's placeholder headcount. */
  employeeCountMin: 2,
  foundingYear: 2026,

  officeHours: [
    { day: "Mon – Fri", hours: "9:00 – 18:00" },
    { day: "Sat", hours: "10:00 – 14:00" },
    { day: "Sun", hours: "Closed" },
  ],
  social: {
    facebook: "#",
    twitter: "#",
    youtube: "#",
  },
  /** Google Business Profile reviews URL — "#" until the firm's real listing is linked (same placeholder convention as `social` above). */
  googleReviewsUrl: "#",
} as const;

/**
 * Real, public social/profile URLs for schema `sameAs` (entity reconciliation
 * for the Knowledge Graph). The template ships only "#" placeholders, so this
 * is intentionally empty — emitting "#" would be invalid. Populate when live.
 */
export const sameAs: string[] = Object.values(siteConfig.social).filter(
  (href) => href && href !== "#",
);

/** Flat center-nav link set shown in every header, per the standardized nav layout. */
export const mainNav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Our Team", href: "/solicitors" },
  // Temporarily hidden while the client-review content is unavailable.
  // { label: "Reviews", href: "/reviews" },
  ...(hasPublishedArticles ? [{ label: "Insights", href: "/blog" }] : []),
  { label: "FAQs", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

export const footerNav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Contact", href: "/contact" },
];

export const footerQuickLinks: NavItem[] = [
  { label: "Solicitors", href: "/solicitors"},
  { label: "Cases", href: "/cases" },
  { label: "FAQs", href: "/faq" },
  ...(hasPublishedArticles ? [{ label: "Blog", href: "/blog" }] : []),
];

export const footerLegalNav: NavItem[] = [
  { label: "Privacy Policy", href: "/legal/privacy-policy" },
  { label: "Cookie Policy", href: "/legal/cookie-policy" },
  { label: "Terms & Conditions", href: "/legal/terms-and-conditions" },
  { label: "Complaints Procedure", href: "/legal/complaints-procedure" },
];
