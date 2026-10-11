import { siteConfig } from "@/config/site";
import type { LegalSection } from "@/types";

export const cookiePolicySections: LegalSection[] = [
  {
    heading: "What cookies are",
    paragraphs: [
      "Cookies are small text files a website stores on your device. We also use similar technologies, like browser local storage, for the same purpose: remembering something between visits. This policy covers both, and should be read alongside our Privacy Policy.",
    ],
  },
  {
    heading: "The cookie categories we use",
    paragraphs: [
      "We group cookies into three categories, matching the choices in our cookie banner. Being specific about what's actually in use (rather than a generic list) is the whole point of this page:",
    ],
    list: [
      "Strictly necessary - always on, can't be switched off. Today, this is limited to one browser storage entry that remembers your cookie preference choice itself, so we don't ask again every visit.",
      "Analytics/performance - off by default. We do not currently run any analytics service (e.g. Google Analytics) on this site. This category exists so that if we add one in future, it activates only for visitors who've actively opted in via the cookie banner - never retroactively and never by default.",
      "Marketing/advertising - off by default. We do not currently run any advertising or retargeting pixels. Same commitment as above: this category is reserved, not silently in use.",
    ],
  },
  {
    heading: "Cookies set by our booking system",
    paragraphs: [
      "Our online consultation booking system does not use cookies to identify you. Your booking is managed instead through a private, unguessable link sent to your email, which only you and we know.",
    ],
  },
  {
    heading: "Managing your preferences",
    paragraphs: [
      "You can change your cookie choices at any time using the \"Manage Preferences\" link in our cookie banner, or by clearing your browser's site data for this domain, which resets your choice and shows the banner again on your next visit.",
      "Most browsers also let you block or delete cookies directly in their settings. Blocking strictly necessary storage may mean the cookie banner reappears on every page, since we can no longer remember that you've already made a choice.",
    ],
  },
  {
    heading: "Questions",
    paragraphs: [`If you have questions about our use of cookies, contact us at ${siteConfig.email}.`],
  },
];
