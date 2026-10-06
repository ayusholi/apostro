import type { Service, ValueItem } from "@/types";

/** The catalog drives the services page and booking flow. */

export const services: Service[] = [
  {
    slug: "civil-litigation",
    number: "01",
    icon: "/images/icon-service-2.png",
    title: "Civil Litigation",
    description:
      "Strategic representation in civil disputes, from initial consultation to trial advocacy.",
    bullets: [],
  },
  {
    slug: "residential-commercial-conveyance",
    number: "02",
    icon: "/images/icon-service-3.png",
    title: "Residential & Commercial Conveyancing",
    description:
      "Efficient, thorough conveyancing and property advice that keeps your transaction moving and your interests protected.",
    bullets: [],
  },
  {
    slug: "commercial-lease",
    number: "03",
    icon: "/images/icon-service-1.png",
    title: "Commercial Leases",
    description:
      "Comprehensive advice on commercial lease agreements, ensuring your business interests are protected.",

    bullets: [],
  },
  {
    slug: "divorce",
    number: "04",
    icon: "/images/icon-service-2.png",
    title: "Divorce",
    description:
      "Sensitive, practical guidance through divorce, custody, and financial settlements, with your family's wellbeing front of mind.",
    bullets: [],
  },
  {
    slug: "financial-settlements",
    number: "05",
    icon: "/images/icon-service-3.png",
    title: "Financial Settlement",
    description: "Clear advice on financial arrangements and settlements following relationship breakdown.",
    bullets: [],
  },
  {
    slug: "child-arrangements",
    number: "06",
    icon: "/images/icon-service-1.png",
    title: "Child Arrangement",
    description:
      "Comprehensive advice on child custody, access, and support arrangements.",
    bullets: [],
  },
  {
    slug: "wills",
    number: "07",
    icon: "/images/icon-service-2.png",
    title: "Wills",
    description: "Practical advice on preparing wills and planning for the future.",
    bullets: [],
  },
  {
    slug: "probate",
    number: "08",
    icon: "/images/icon-service-3.png",
    title: "Probate",
    description: "Support with estate administration and the probate process after a bereavement.",
    bullets: [],
  },
];

/**
 * Consultation length per service, for the booking flow only — the original
 * content has no notion of appointment duration. Kept separate from the
 * display `Service` type so nothing that already renders a ServiceCard etc.
 * needs to change.
 */
export const serviceDurationMinutes: Record<string, number> = Object.fromEntries(
  services.map((service) => [service.slug, 30]),
);

export type ServiceDetail = {
  image: string;
  heading: string;
  paragraphs: string[];
  values: ValueItem[];
};

export const serviceDetails: Record<string, ServiceDetail> = {};

export function getServiceBySlug(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}
