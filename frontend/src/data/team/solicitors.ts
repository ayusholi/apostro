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
    role: "Solicitor",
    image: "/images/ugochukwu-muoma.jpeg",
    bio: "Ugochukwu Muoma is a solicitor with over three years’ post-qualification experience, specialising in residential and commercial conveyancing, civil litigation, and probate. He brings strong advocacy and drafting skills, alongside a keen focus on business development and achieving practical outcomes for clients.",
    qualifications: [
      "LLB (Hons), University of Manchester",
      "Legal Practice Course, BPP Law School",
      "Solicitor of England and Wales (admitted 2004)",
    ],
    practiceAreaSlugs: ["civil-litigation", "residential-commercial-conveyance", "commercial-lease", "probate"],
    languages: ["English", "French"],
    experienceYears: 10,
    memberships: ["The Law Society of England and Wales", "Criminal Law Solicitors' Association", "Law Society Criminal Litigation Accreditation"],
    email: "ugo@alls-legal.co.uk",
  },
  {
    slug: "osasere-ebosele",
    name: "Osasere Ebosele",
    role: "Solicitor",
    image: "/images/person-2.jpg",
    bio: "Osasere Ebosele is a solicitor with over three years’ post-qualification experience, specialising in family law, private client matters, and immigration. She is recognised for her strong negotiation and client-management skills, supported by extensive regulatory knowledge and a client-focused approach.",
    qualifications: [
      "LLB (Hons), University of Bristol",
      "Legal Practice Course, University of Law",
      "Solicitor of England and Wales (admitted 2011)",
    ],
    practiceAreaSlugs: ["divorce", "financial-settlements", "child-arrangements", "wills"],
    languages: ["English"],
    experienceYears: 15,
    memberships: ["The Law Society of England and Wales", "Resolution (family law)", "Law Society Family Law Advanced Scheme"],
    email: "osasere@alls-legal.co.uk",
  },
];

export function getSolicitorBySlug(slug: string): Solicitor | undefined {
  return solicitors.find((s) => s.slug === slug);
}
