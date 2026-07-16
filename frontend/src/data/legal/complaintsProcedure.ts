import { siteConfig } from "@/config/site";
import { legalConfig } from "@/config/legal";
import type { LegalSection } from "@/types";

export const complaintsProcedureSections: LegalSection[] = [
  {
    heading: "Our commitment",
    paragraphs: [
      "We're committed to providing a high-quality service to every client. If something goes wrong, we want to know about it so we can put it right — this page explains how to raise a concern and what happens next.",
    ],
  },
  {
    heading: "How to make a complaint",
    paragraphs: [
      `In the first instance, please raise your concern with the solicitor handling your matter — many issues are resolved quickly this way. If you'd prefer not to, or aren't satisfied after doing so, you can make a formal complaint in writing to our Client Care Partner at ${siteConfig.email} or by post to ${siteConfig.address}.`,
      "Please include your name, matter reference (if you have one), and as much detail as possible about what happened and what outcome you're looking for.",
    ],
  },
  {
    heading: "What happens next",
    paragraphs: ["Our standard complaints timeline is:"],
    list: [
      "We'll acknowledge your complaint in writing within 3 working days.",
      "We'll investigate, which may include reviewing your file and speaking with the people involved.",
      "We'll send you a full written response, normally within 8 weeks of your complaint.",
      "If our investigation takes longer than expected, we'll write to explain why and give a revised timeframe.",
    ],
  },
  {
    heading: "If you're not satisfied with our response",
    paragraphs: [
      `If you remain unhappy after receiving our final response — or if 8 weeks have passed since you first complained and we haven't resolved it — you can ask the ${legalConfig.legalOmbudsman.name} to look into your complaint, independently and free of charge.`,
    ],
    list: [
      "Normally, you'll need to refer your complaint to the Legal Ombudsman within 1 year of the date of our final response letter.",
      "The Legal Ombudsman also generally expects complaints within 6 years of the problem happening, or 3 years of when you should reasonably have found out about it.",
      `Contact the Legal Ombudsman at ${legalConfig.legalOmbudsman.website}, by phone on 0300 555 0333, or by post at PO Box 6167, Slough SL1 0EH.`,
    ],
  },
  {
    heading: "Concerns about professional conduct",
    paragraphs: [
      `The Legal Ombudsman deals with service complaints — for example, delay, poor communication, or billing concerns. If your concern is instead about our professional conduct or integrity (for example, dishonesty or discrimination), you can raise it directly with our regulator, the Solicitors Regulation Authority, at ${legalConfig.sra.website}.`,
    ],
  },
  {
    heading: "Alternative formats",
    paragraphs: [
      `If you'd find it easier to complain by phone or need this information in another format, call us on ${siteConfig.phone} and we'll assist.`,
    ],
  },
];
