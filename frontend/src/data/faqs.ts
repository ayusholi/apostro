import type { Faq } from "@/types";

/** The home page's FAQ preview renders faqs.slice(0, 4) — same order, same subset as the source index.html. */
export const faqs: Faq[] = [
  {
    question: "How does the first consultation work?",
    answer:
      "We start with a confidential discovery call to understand your situation, then outline next steps and fee structure in writing.",
  },
  {
    question: "How are your fees structured?",
    answer:
      "Depending on the matter, we offer fixed-fee packages, hourly rates, or retainers. We agree on scope and pricing before work begins.",
  },
  {
    question: "Do you offer a free initial consultation?",
    answer:
      "Yes, we offer a free initial consultation so we can understand your situation and explain how we can help before you commit to anything.",
  },
  {
    question: "What documents should I bring?",
    answer:
      "Anything relevant to your matter, contracts, correspondence, filings, photos. We'll send a checklist after intake.",
  },
  {
    question: "How long does a typical case take?",
    answer:
      "Timelines vary by matter. Many civil cases resolve in 3–9 months; complex litigation can run longer.",
  },
  {
    question: "Is my information kept confidential?",
    answer:
      "Always. Your communications with us are generally confidential, subject to limited legal exceptions.",
  },
];
