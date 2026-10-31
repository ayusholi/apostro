import type { Solicitor } from "@/domain/team/Solicitor";

/**
 * The firm's single canonical people list. Booking's scheduling metadata
 * (src/data/solicitors.ts) and the blog's author bylines (src/data/blog/authors.ts,
 * for the three who also write) both key off these same slugs, so a name,
 * photo, or departure only needs updating in one place.
 */
export const solicitors: Solicitor[] = [
  {
    slug: "ugo-muoma",
    name: "Ugo Muoma",
    role: "Solicitor",
    image: "/images/ugo-muoma.jpeg",
    bio: `Ugo Muoma is a Director and solicitor with over four years’ post-qualification experience, specialising in residential and commercial conveyancing, litigation, and probate.

He brings strong advocacy and drafting skills, alongside a keen focus on business development and achieving practical outcomes for clients.`,
    qualifications: [
      "LLB (Hons)",
      "Solicitor of England and Wales",
    ],
    practiceAreaSlugs: ["litigation-dispute-resolution", "real-estate", "corporate-practice"],
    languages: ["English"],
    experienceYears: 4,
    memberships: ["The Law Society of England and Wales", "Law Society Conveyancing Quality Scheme"],
    email: "info@alls-legal.co.uk",
  },
  {
    slug: "osas-ebosele",
    name: "Osas Ebosele",
    role: "Solicitor",
    image: "/images/osasebosele.jpeg",
    bio: `I am a Solicitor of England and Wales, and since qualifying in 2022 I have focused my practice on Family Law and Private Client matters. My work centres on guiding clients through sensitive and often emotional situations with clarity, empathy, and practical legal support.

My approach is always client‑focused, ensuring that the service I provide is tailored to each person’s unique needs and firmly aligned with their best interests.

I have been practising since 2016, when I obtained my first qualification as an advocate outside of England and Wales.

I have strong negotiation skills and have successfully achieved favourable settlements both before litigation and during court proceedings. My background in counselling allows me to connect with clients on a deeper level, helping them feel understood and supported during challenging periods such as divorce, separation, or the loss of a loved one while dealing with their probate matters.

As a Resolution member, I am committed to resolving disputes amicably wherever possible. When court proceedings become necessary, I work to make the process as straightforward and stress‑free as I can for my clients.

Outside of work, I enjoy spending quality time with my family and I’m a keen sports enthusiast. I am also passionate about community service and support charitable initiatives that help meet the needs of people through non‑governmental organisations.`,
    qualifications: [
      "LLB (Hons)",
      "Solicitor of England and Wales",
    ],
    practiceAreaSlugs: ["family-law", "private-client"],
    languages: ["English"],
    experienceYears: 4,
    memberships: ["The Law Society of England and Wales", "Resolution (family law)", "Law Society Family Law Advanced Scheme"],
    email: "info@alls-legal.co.uk",
  },
];

export function getSolicitorBySlug(slug: string): Solicitor | undefined {
  return solicitors.find((s) => s.slug === slug);
}
