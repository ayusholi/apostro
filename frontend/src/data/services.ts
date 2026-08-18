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
    slug: "mediation",
    number: "01",
    icon: "/images/icon-service-1.png",
    title: "Mediation",
    description:
      "A collaborative approach to resolving disputes, focusing on communication and mutually beneficial solutions.",
    bullets: [],
  },
  {
    slug: "civil-litigation",
    number: "02",
    icon: "/images/icon-service-2.png",
    title: "Civil Litigation",
    description:
      "Strategic representation in civil disputes, from initial consultation to trial advocacy.",
    bullets: [],
  },
  {
    slug: "residential-commercial-conveyance",
    number: "03",
    icon: "/images/icon-service-3.png",
    title: "Residential & Commercial Conveyance",
    description:
      "Efficient, thorough conveyancing and property advice that keeps your transaction moving and your interests protected.",
    bullets: [],
  },
  {
    slug: "commercial-lease",
    number: "04",
    icon: "/images/icon-service-1.png",
    title: "Commercial Lease",
    description:
      "Comprehensive advice on commercial lease agreements, ensuring your business interests are protected.",

    bullets: [],
  },
  {
    slug: "divorce",
    number: "05",
    icon: "/images/icon-service-2.png",
    title: "Divorce",
    description:
      "Sensitive, practical guidance through divorce, custody, and financial settlements, with your family's wellbeing front of mind.",
    bullets: [],
  },
  {
    slug: "financial-settlements",
    number: "06",
    icon: "/images/icon-service-3.png",
    title: "Financial Settlements",
    description:
      "Efficient, thorough conveyancing and property advice that keeps your transaction moving and your interests protected.",
    bullets: [],
  },
  {
    slug: "child-arrangements",
    number: "07",
    icon: "/images/icon-service-1.png",
    title: "Child Arrangements",
    description:
      "Comprehensive advice on child custody, access, and support arrangements.",
    bullets: [],
  },
  {
    slug: "wills-probate",
    number: "08",
    icon: "/images/icon-service-2.png",
    title: "Wills & Probate",
    description:
      "Comprehensive estate planning and probate services to ensure your wishes are carried out.",
    bullets: [],
  },
  {
    slug: "employment-commercial-lease",
    number: "09",
    icon: "/images/icon-service-3.png",
    title: "Employment & Commercial Lease",
    description:
      "Comprehensive advice on employment law and commercial lease agreements, ensuring your business interests are protected.",
    bullets: [],
  },
];

/**
 * Consultation length per service, for the booking flow only — the original
 * content has no notion of appointment duration. Kept separate from the
 * display `Service` type so nothing that already renders a ServiceCard etc.
 * needs to change.
 */
export const serviceDurationMinutes: Record<string, number> = {
  "mediation": 45,
  "civil-litigation": 30,
  "residential-commercial-conveyance": 60,
  "commercial-lease": 45,
  "divorce": 60,
  "financial-settlements": 30,
  "child-arrangements": 45,
  "wills-probate": 30,
  "employment-commercial-lease": 45,
};

export type ServiceDetail = {
  image: string;
  heading: string;
  paragraphs: string[];
  values: ValueItem[];
};

export const serviceDetails: Record<string, ServiceDetail> = {
  "mediation": {
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
