import type { Service, ValueItem } from "@/types";

/** The catalog drives the services page and booking flow. */

export const services: Service[] = [
  {
    slug: "litigation-dispute-resolution",
    number: "01",
    icon: "/images/icon-service-2.png",
    title: "Civil Litigation and Dispute Resolution",
    description:
      "Strategic representation in civil disputes, from initial consultation through to dispute resolution or trial advocacy.",
    bullets: ["General Litigation", "Dispute Resolution"],
  },
  {
    slug: "family-law",
    number: "02",
    icon: "/images/icon-service-1.png",
    title: "Family Law",
    description:
      "Sensitive, practical guidance through divorce, financial settlements, and child arrangements, with your family's wellbeing front of mind.",
    bullets: ["Divorce", "Financial settlements", "Child arrangements"],
  },
  {
    slug: "real-estate",
    number: "03",
    icon: "/images/icon-service-3.png",
    title: "Property Conveyance",
    description:
      "Efficient, thorough conveyancing and commercial lease advice that keeps your transaction moving and your interests protected.",
    bullets: ["Residential", "Commercial", "Leases"],
  },
  {
    slug: "private-client",
    number: "04",
    icon: "/images/icon-service-2.png",
    title: "Private Client",
    description:
      "Practical advice on wills, probate, and trusts, helping you plan for the future and supporting estate administration after a bereavement.",
    bullets: ["Wills", "Probate", "Trusts"],
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
