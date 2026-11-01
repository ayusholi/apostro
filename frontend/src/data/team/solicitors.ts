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
    bio: `Osas Ebosele is a Solicitor of England and Wales, who qualified as a solicitor in England and Wales  in 2022. Since her qualification, she specialises in Family Law and Private Client matters. She take delight in guiding clients through sensitive and often emotional situations with clarity, empathy, and practical legal support. She has dealt with high net worth cases as well as matters that have international elements.

Her approach is always client‑focused, ensuring that the services she provide are tailored to each client's unique needs and in their best interests.

She has previously qualified as a Solicitor and advocate in 2016, outside of the Jurisdiction of England and Wales.

She is well known for her  strong negotiation skills and have successfully achieved favourable settlements both before litigation and during court proceedings. She also have background in counselling which help her to connect with clients during challenging periods such as divorce, separation, or the loss of a loved one while dealing with their probate matters.

As a Resolution member, she is committed to resolving disputes amicably wherever possible. When court proceedings become necessary, she is dedicated to ensure the process as straightforward and stress‑free as it can be for clients.

Outside of work, she enjoys spending quality time with her family and  also passionate about community service and support charitable initiatives that help meet the needs of people through non‑governmental organisations`,
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
