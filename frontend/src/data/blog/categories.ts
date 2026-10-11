import type { Category } from "@/domain/blog/Post";

export const categories: Category[] = [
  {
    slug: "criminal-defense",
    name: "Criminal Defense",
    description: "Guidance on arrests, charges, court process, and your rights during a criminal case.",
  },
  {
    slug: "family-law",
    name: "Family Law",
    description: "Divorce, custody, and other family matters, what to expect and how to prepare.",
  },
  {
    slug: "corporate-law",
    name: "Corporate & Commercial",
    description: "Practical guidance for founders and businesses, contracts, structuring, and compliance.",
  },
  {
    slug: "real-estate",
    name: "Property & Conveyancing",
    description: "Buying, selling, and leasing property, process, pitfalls, and paperwork.",
  },
  {
    slug: "legal-guides",
    name: "Legal Guides",
    description: "General guidance on working with a solicitor and understanding your legal options.",
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}
