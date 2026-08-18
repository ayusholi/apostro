import type { NavItem } from "@/types";

export const siteConfig = {
  name: "ALLS",
  /** Full legal entity name for Organization.legalName — @see src/config/legal.ts for the rest of the regulatory detail. */
  legalName: "ALLS Solicitors Limited",
  tagline: "Solicitors & Legal Counsel",
  description:
    "ALLS is a London law firm delivering dependable counsel across criminal defence, corporate, and family law. Serving 45,000+ clients across the United Kingdom.",
  /** Canonical production origin — drives metadataBase, canonicals, sitemap, and schema @ids. */
  url: "https://alls-legal.co.uk",
  /** Default social-share image (1200×630), generated into /public. */
  ogImage: "/og-image.jpg",
  /** BCP-47 tag for <html lang>. UK firm → en-GB. */
  htmlLang: "en-GB",
  /** Open Graph locale (underscore form). */
  locale: "en_GB",

  // Contact — the visible phone is a placeholder carried over from the source
  // template (US format). Schema/telephone deliberately mirror the on-page
  // value so structured data matches visible content; swap for a real UK
  // number (e.g. +44 20 …) when known.
  phone: "+44 02071833139",
  phoneHref: "tel:+4402071833139",
  phoneE164: "+4402071833139",
  email: "info@alls-legal.co.uk",
  emailHref: "mailto:info@alls-legal.co.uk",
  address: "20 Store Street, London, United Kingdom",

  /** Structured postal address for PostalAddress schema (GB conventions). */
  postalAddress: {
    streetAddress: "20 Store Street, London",
    addressLocality: "Stratford",
    addressRegion: "London",
    postalCode: "E15 1PU",
    addressCountry: "GB",
  },
  /** Coordinates of the stated address (the London Eye) for LocalBusiness geo. */
  geo: { latitude: 51.5469062, longitude: -0.1191022 },
  areaServed: "United Kingdom",
  priceRange: "££",
  employeeCountMin: 120,
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
  { label: "Our Team", href: "/attorneys" },
  { label: "Reviews", href: "/reviews" },
  { label: "Insights", href: "/blog" },
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
  { label: "Attorneys", href: "/attorneys" },
  { label: "Cases", href: "/cases" },
  { label: "FAQs", href: "/faq" },
  { label: "Blog", href: "/blog" },
];

export const footerLegalNav: NavItem[] = [
  { label: "Privacy Policy", href: "/legal/privacy-policy" },
  { label: "Cookie Policy", href: "/legal/cookie-policy" },
  { label: "Terms & Conditions", href: "/legal/terms-and-conditions" },
  { label: "Complaints Procedure", href: "/legal/complaints-procedure" },
  { label: "Accessibility Statement", href: "/legal/accessibility-statement" },
];
