import { siteConfig } from "@/config/site";
import { legalConfig } from "@/config/legal";
import type { LegalSection } from "@/types";

export const termsAndConditionsSections: LegalSection[] = [
  {
    heading: "About these terms",
    paragraphs: [
      `These terms govern your use of ${siteConfig.url} (the "site"), operated by ${legalConfig.tradingDisclosure}, company number ${legalConfig.companyNumber}, registered in ${legalConfig.jurisdiction}. By using this site, you accept these terms.`,
      "These are website terms of use only. If you instruct us to act for you, that relationship is governed separately by our formal client engagement letter and terms of business, which take precedence over this page for any matter we handle for you.",
    ],
  },
  {
    heading: "This site is not legal advice",
    paragraphs: [
      "Nothing on this site — including our services pages, blog, FAQs, and case studies — constitutes legal advice, and no solicitor-client relationship is formed by browsing the site, reading its content, or submitting an enquiry through it.",
      "A solicitor-client relationship, and the duties that come with it, begins only once we've confirmed in writing that we're acting for you, run the required conflict and identity checks, and agreed terms of engagement.",
    ],
  },
  {
    heading: "Enquiries and bookings",
    paragraphs: [
      "Submitting an enquiry or booking a consultation does not guarantee we can act for you — we may decline any matter, including for conflict-of-interest reasons, before an engagement is confirmed.",
      "Consultation bookings are subject to the cancellation and rescheduling terms shown at the time of booking and in your confirmation email.",
    ],
  },
  {
    heading: "Intellectual property",
    paragraphs: [
      `All content on this site — text, graphics, logos, and design — belongs to ${siteConfig.name} or its licensors, unless stated otherwise. You may view and print pages for your own personal, non-commercial reference, but may not republish, redistribute, or reproduce any part of this site without our written permission.`,
    ],
  },
  {
    heading: "No warranty",
    paragraphs: [
      "We try to keep this site accurate and up to date, but we make no warranty that its content is complete, current, or error-free, and we may change or remove any part of it at any time without notice.",
    ],
  },
  {
    heading: "Limitation of liability",
    paragraphs: [
      "To the fullest extent permitted by law, we exclude liability for any loss arising from your use of, or inability to use, this site, or from reliance on its content. Nothing in these terms limits liability for death or personal injury caused by negligence, fraud, or any other liability that cannot lawfully be excluded.",
    ],
  },
  {
    heading: "Links to other sites",
    paragraphs: [
      "This site may link to third-party websites for convenience. We don't control and aren't responsible for their content, availability, or privacy practices.",
    ],
  },
  {
    heading: "Governing law",
    paragraphs: [
      `These terms are governed by the law of ${legalConfig.jurisdiction}, and the courts of ${legalConfig.jurisdiction} have exclusive jurisdiction over any dispute arising from them.`,
    ],
  },
  {
    heading: "Contact",
    paragraphs: [`Questions about these terms can be sent to ${siteConfig.email}.`],
  },
];
