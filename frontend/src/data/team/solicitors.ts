import type { Solicitor } from "@/domain/team/Solicitor";

/**
 * The firm's single canonical people list. Booking's scheduling metadata
 * (src/data/solicitors.ts) and the blog's author bylines (src/data/blog/authors.ts,
 * for the three who also write) both key off these same slugs, so a name,
 * photo, or departure only needs updating in one place.
 */
export const solicitors: Solicitor[] = [
  {
    slug: "ugochukwu-muoma",
    name: "Ugochukwu Muoma",
    role: "Director / Solicitor — COFA",
    image: "/images/ugochukwu-muoma.jpeg",
    bio: "Ugochukwu Muoma is a Director and solicitor with over three years’ post-qualification experience, specialising in residential and commercial conveyancing, civil litigation, and probate. He brings strong advocacy and drafting skills, alongside a keen focus on business development and achieving practical outcomes for clients.",
    qualifications: [
      "LLB (Hons), University of Manchester",
      "Legal Practice Course, BPP Law School",
      "Solicitor of England and Wales",
    ],
    practiceAreaSlugs: ["litigation-dispute-resolution", "real-estate", "private-client"],
    languages: ["English", "French"],
    experienceYears: 3,
    memberships: ["The Law Society of England and Wales", "Law Society Conveyancing Quality Scheme"],
    email: "info@alls-legal.co.uk",
  },
  {
    slug: "osasere-ebosele",
    name: "Osasere Ebosele",
    role: "Director / Solicitor — COLP",
    image: "/images/osasereebosele.jpg",
    bio: "Osasere Ebosele is a Director and solicitor with over three years’ post-qualification experience, specialising in family law, private client matters, and immigration. She is recognised for her strong negotiation and client-management skills, supported by extensive regulatory knowledge and a client-focused approach.",
    qualifications: [
      "LLB (Hons), University of Bristol",
      "Legal Practice Course, University of Law",
      "Solicitor of England and Wales",
    ],
    practiceAreaSlugs: ["family-law", "private-client"],
    languages: ["English"],
    experienceYears: 3,
    memberships: ["The Law Society of England and Wales", "Resolution (family law)", "Law Society Family Law Advanced Scheme"],
    email: "info@alls-legal.co.uk",
  },
];

export function getSolicitorBySlug(slug: string): Solicitor | undefined {
  return solicitors.find((s) => s.slug === slug);
}
