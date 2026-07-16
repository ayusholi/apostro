import { siteConfig } from "@/config/site";
import type { LegalSection } from "@/types";

export const accessibilityStatementSections: LegalSection[] = [
  {
    heading: "Our commitment",
    paragraphs: [
      `${siteConfig.name} wants everyone who visits this site — including disabled people, older people, and people using assistive technology — to be able to find information and get in touch without difficulty. We've built this site to conform to WCAG 2.2 at Level AA, and we test against that standard as the site changes.`,
    ],
  },
  {
    heading: "What we've done",
    paragraphs: ["Some of the concrete things this site does:"],
    list: [
      "A visible \"Skip to main content\" link for keyboard users, at the very start of every page.",
      "Semantic headings, landmarks, and breadcrumb navigation, including matching structured data so the visible trail and what a screen reader announces never disagree.",
      "Keyboard-operable interactive components, including the consultation booking calendar (arrow-key date grid) and the reviews filters and pagination.",
      "Colour choices checked for contrast against our dark theme, and no information conveyed by colour alone.",
      "Loading, empty, and error states that are announced to assistive technology (via aria-live regions), not just shown visually.",
      "Respect for your operating system's \"reduce motion\" setting — our scroll animations turn off automatically if you've asked for that.",
    ],
  },
  {
    heading: "Known limitations",
    paragraphs: [
      "We aim to be honest here rather than claim perfection:",
    ],
    list: [
      "Our video testimonials are placeholders pending real client footage; once real videos are added, we'll caption them before publishing.",
      "Some third-party embedded content (for example, a future live map or payment provider) may not fully meet AA on day one — we test and fix these as they're added.",
    ],
  },
  {
    heading: "Reporting an accessibility problem",
    paragraphs: [
      `If you find content on this site that you can't access, or a barrier we've missed, please tell us — we treat this as seriously as any other client-facing issue. Contact us at ${siteConfig.email} or ${siteConfig.phone}, and let us know the page and what happened; we aim to respond within 5 working days.`,
    ],
  },
  {
    heading: "Alternative formats",
    paragraphs: [
      "If you need information from this site in a different format — large print, easy read, or over the phone — contact us using the details above and we'll arrange it.",
    ],
  },
];
