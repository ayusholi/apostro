import type { Solicitor } from "@/domain/team/Solicitor";

/**
 * The firm's single canonical people list. Booking's scheduling metadata
 * (src/data/solicitors.ts) and the blog's author bylines (src/data/blog/authors.ts,
 * for the three who also write) both key off these same slugs, so a name,
 * photo, or departure only needs updating in one place.
 */
export const solicitors: Solicitor[] = [
  {
    slug: "wayne-bell",
    name: "Wayne Bell",
    role: "Senior Partner, Criminal Defense",
    image: "/images/person-1.jpg",
    bio: "Wayne leads the criminal defence team, with over two decades spent defending clients in the Crown Court. He's built a reputation for meticulous case preparation and a calm, evidence-led approach under pressure.",
    qualifications: [
      "LLB (Hons), University of Manchester",
      "Legal Practice Course, BPP Law School",
      "Solicitor of England and Wales (admitted 2004)",
    ],
    practiceAreaSlugs: ["criminal-defense", "legal-consultation"],
    languages: ["English"],
    experienceYears: 22,
    memberships: ["The Law Society of England and Wales", "Criminal Law Solicitors' Association", "Law Society Criminal Litigation Accreditation"],
    email: "wayne.bell@alls.law",
  },
  {
    slug: "anne-key",
    name: "Anne Key",
    role: "Partner, Family Law",
    image: "/images/person-2.jpg",
    bio: "Anne leads the family law team, specialising in resolving disputes over children and finances without unnecessary court conflict. She's a strong advocate for mediation wherever it genuinely serves the client's interests.",
    qualifications: [
      "LLB (Hons), University of Bristol",
      "Legal Practice Course, University of Law",
      "Solicitor of England and Wales (admitted 2011)",
    ],
    practiceAreaSlugs: ["family-law", "legal-consultation"],
    languages: ["English", "French"],
    experienceYears: 15,
    memberships: ["The Law Society of England and Wales", "Resolution (family law)", "Law Society Family Law Advanced Scheme"],
    email: "anne.key@alls.law",
  },
];

export function getSolicitorBySlug(slug: string): Solicitor | undefined {
  return solicitors.find((s) => s.slug === slug);
}
