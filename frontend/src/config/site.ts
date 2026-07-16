import type { NavItem } from "@/types";

export const siteConfig = {
  name: "ALLS",
  /** Full legal entity name for Organization.legalName — @see src/config/legal.ts for the rest of the regulatory detail. */
  legalName: "ALLS Solicitors Limited",
  tagline: "Solicitors & Legal Counsel",
  description:
    "ALLS is a London law firm delivering dependable counsel across criminal defence, corporate, and family law. Serving 45,000+ clients across the United Kingdom.",
  /** Canonical production origin — drives metadataBase, canonicals, sitemap, and schema @ids. */
  url: "https://alls.law",
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
  phone: "+1 (555) 123-4567",
  phoneHref: "tel:+15551234567",
  phoneE164: "+15551234567",
  email: "hello@alls.law",
  emailHref: "mailto:hello@alls.law",
  address: "London Eye, London",

  /** Structured postal address for PostalAddress schema (GB conventions). */
  postalAddress: {
    streetAddress: "London Eye",
    addressLocality: "London",
    addressRegion: "London",
    postalCode: "",
    addressCountry: "GB",
  },
  /** Coordinates of the stated address (the London Eye) for LocalBusiness geo. */
  geo: { latitude: 51.5033, longitude: -0.1196 },
  /** Country served, from the site's "nationwide" positioning, scoped to the UK. */
  areaServed: "United Kingdom",
  /** LocalBusiness price indicator (GBP). */
  priceRange: "££",
  /** Derived from the on-page "120+ Expert Attorneys" stat. */
  employeeCountMin: 120,
  /** Derived from the on-page "25+ Years in Practice" stat (2026 − 25). */
  foundingYear: 2001,

  officeHours: [
    { day: "Mon–Fri", hours: "9:00 – 18:00" },
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
