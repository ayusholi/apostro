import type { Service, ValueItem } from "@/types";

/**
 * Only "criminal-defense" carries full detail content (`detail`) because the
 * source template ships exactly one detail page (single-services.html). The
 * other five cards' "Learn More" links route to /services rather than a
 * fabricated detail page, since only criminal-defense has one to show
 * (@see ServiceCard).
 */
export const services: Service[] = [
  {
    slug: "criminal-defense",
    number: "01",
    icon: "/images/icon-service-1.png",
    title: "Criminal Defense",
    description:
      "Robust representation from first police interview through trial, protecting your rights and your future.",
    bullets: ["Case Analysis", "Legal Protection"],
  },
  {
    slug: "legal-consultation",
    number: "02",
    icon: "/images/icon-service-2.png",
    title: "Legal Consultation",
    description:
      "Clear, practical advice on your options before you commit to any course of action — no jargon, no pressure.",
    bullets: ["Initial Assessment", "Tailored Advice"],
  },
  {
    slug: "mergers-acquisitions",
    number: "03",
    icon: "/images/icon-service-3.png",
    title: "Mergers & Acquisitions",
    description:
      "End-to-end deal support, from due diligence to completion, protecting your interests at every stage.",
    bullets: ["Due Diligence", "Deal Structuring"],
  },
  {
    slug: "family-law",
    number: "04",
    icon: "/images/icon-service-1.png",
    title: "Family Law",
    description:
      "Sensitive, practical guidance through divorce, custody, and financial settlements, with your family's wellbeing front of mind.",
    bullets: ["Mediation Support", "Child Arrangements"],
  },
  {
    slug: "corporate-law",
    number: "05",
    icon: "/images/icon-service-2.png",
    title: "Corporate Law",
    description:
      "Commercially-minded counsel on formation, governance, and compliance, so you can focus on running your business.",
    bullets: ["Contract Drafting", "Compliance Advice"],
  },
  {
    slug: "real-estate",
    number: "06",
    icon: "/images/icon-service-3.png",
    title: "Real Estate",
    description:
      "Efficient, thorough conveyancing and property advice that keeps your transaction moving and your interests protected.",
    bullets: ["Conveyancing", "Contract Review"],
  },
];

/**
 * Consultation length per service, for the booking flow only — the original
 * content has no notion of appointment duration. Kept separate from the
 * display `Service` type so nothing that already renders a ServiceCard etc.
 * needs to change.
 */
export const serviceDurationMinutes: Record<string, number> = {
  "criminal-defense": 45,
  "legal-consultation": 30,
  "mergers-acquisitions": 60,
  "family-law": 45,
  "corporate-law": 60,
  "real-estate": 30,
};

export type ServiceDetail = {
  image: string;
  heading: string;
  paragraphs: string[];
  values: ValueItem[];
};

export const serviceDetails: Record<string, ServiceDetail> = {
  "criminal-defense": {
    image: "/images/service-detail-1.jpg",
    heading: "Protecting Your Rights at Every Stage",
    paragraphs: [
      "Facing a criminal charge is one of the most stressful experiences a person can go through. We step in early, explain your options in plain terms, and build a defense strategy around the specific facts of your case.",
      "From bail hearings to trial advocacy, our team provides clear-eyed counsel and aggressive defense tailored to the facts of your case.",
    ],
    values: [
      {
        number: "01",
        title: "Case Analysis",
        description: "Comprehensive review of charges, evidence, and procedural history.",
      },
      {
        number: "02",
        title: "Legal Protection",
        description: "Aggressive motion practice to suppress unlawfully obtained evidence.",
      },
      {
        number: "03",
        title: "Trial Advocacy",
        description: "Courtroom-tested attorneys with a record of favorable verdicts.",
      },
    ],
  },
};

export function getServiceBySlug(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}
