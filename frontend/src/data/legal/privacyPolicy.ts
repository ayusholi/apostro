import { siteConfig } from "@/config/site";
import { legalConfig } from "@/config/legal";
import type { LegalSection } from "@/types";

export const privacyPolicySections: LegalSection[] = [
  {
    heading: "Who we are",
    paragraphs: [
      `This policy explains how ${legalConfig.tradingDisclosure} ("ALLS", "we", "us") collects, uses, and protects personal data when you visit ${siteConfig.url}, submit an enquiry, or book a consultation with us.`,
      `We are the data controller for the personal data described in this policy. Our registered office is ${siteConfig.address}, and you can contact us at ${siteConfig.email} or ${siteConfig.phone} with any privacy question.`,
    ],
  },
  {
    heading: "What personal data we collect",
    paragraphs: ["We collect personal data you give us directly, and a small amount collected automatically:"],
    list: [
      "Enquiry form: your name, email address, phone number, the service you're enquiring about, and the message you send us.",
      "Consultation booking: your name, email, phone number, any notes you add, and your chosen solicitor, office, and appointment time.",
      "If your enquiry proceeds to a client matter: whatever further information is necessary to advise you, collected separately under our engagement terms, not covered by this website policy.",
      "Technical data: standard web server logs (IP address, browser type, pages visited) and, only if you've consented via our cookie banner, analytics data. See our Cookie Policy for full detail.",
    ],
  },
  {
    heading: "How we use your data, and our lawful basis",
    paragraphs: ["UK GDPR requires us to have a lawful basis for each way we use your data:"],
    list: [
      "Responding to an enquiry you send us, lawful basis: legitimate interests (ours, in running our business, and yours, in getting a reply).",
      "Arranging and managing a booked consultation, including confirmation, reminder, reschedule, and cancellation emails, lawful basis: performance of a contract (or steps taken at your request before one).",
      "Sending legal updates or newsletters, lawful basis: consent, only if you've explicitly opted in, and only until you withdraw it.",
      "Keeping records once you become a client, lawful basis: legal obligation (SRA and anti-money-laundering record-keeping rules) and contract.",
    ],
  },
  {
    heading: "Cookies and similar technologies",
    paragraphs: [
      "We use a small number of cookies and browser storage entries to run this site and, only with your consent, to understand how it's used. Full detail, including that we do not currently run any analytics or advertising cookies, is in our Cookie Policy.",
    ],
  },
  {
    heading: "Who we share your data with",
    paragraphs: [
      "We don't sell personal data. We share it only with the service providers who help us run our practice, for example, our website hosting provider and (once configured) our transactional email provider, each acting under a data processing agreement, and only to the extent needed to provide the service.",
      "We may also disclose data where required by law, to our insurers or professional regulators in connection with a claim or regulatory enquiry, or to the Legal Ombudsman/SRA in connection with a complaint.",
    ],
  },
  {
    heading: "How long we keep your data",
    paragraphs: [
      "Enquiries that don't turn into a client matter are kept for up to 24 months, then deleted.",
      "Client files are retained for at least 6 years after a matter concludes, in line with our professional indemnity insurance requirements and SRA guidance, longer for certain matter types (e.g. wills, trusts, matters involving minors) where the law requires it.",
    ],
  },
  {
    heading: "Your rights",
    paragraphs: ["Under UK GDPR, you have the right to:"],
    list: [
      "Ask for a copy of the personal data we hold about you",
      "Ask us to correct inaccurate data",
      "Ask us to delete your data, where we're not required to keep it",
      "Ask us to restrict or object to certain processing",
      "Ask for your data in a portable format",
      "Withdraw consent at any time, where consent is our lawful basis",
    ],
  },
  {
    heading: "How to complain",
    paragraphs: [
      `To exercise any of the rights above, contact us at ${siteConfig.email}. If you're unhappy with how we've handled your data, you also have the right to complain to the Information Commissioner's Office (ICO) at ico.org.uk, we'd appreciate the chance to put things right first.`,
    ],
  },
  {
    heading: "Changes to this policy",
    paragraphs: [
      "We'll update this page if how we handle personal data changes, and update the \"last reviewed\" date at the top. We encourage you to check back periodically.",
    ],
  },
];
