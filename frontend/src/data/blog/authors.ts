import type { Author } from "@/domain/blog/Post";

/**
 * Reuses the same names/photos as the firm's solicitor directory (@see
 * src/data/team/solicitors.ts) for narrative consistency — partners writing
 * the firm's own blog is realistic — but is a standalone record set, not an
 * import, so the blog domain doesn't take a compile-time dependency on the
 * team directory.
 */
export const authors: Author[] = [
  {
    slug: "wayne-bell",
    name: "Wayne Bell",
    role: "Senior Partner, Criminal Defense",
    image: "/images/person-1.jpg",
    bio: "Wayne has spent over 20 years defending clients in the Crown Court, with a particular focus on cases involving disputed evidence.",
  },
  {
    slug: "anne-key",
    name: "Anne Key",
    role: "Partner, Family Law",
    image: "/images/person-2.jpg",
    bio: "Anne leads the family law team, specialising in resolving disputes over children and finances without unnecessary court conflict.",
  },
  {
    slug: "john-doe",
    name: "John Doe",
    role: "Partner, Corporate & Commercial",
    image: "/images/person-3.jpg",
    bio: "John advises founders and growing businesses on structuring, contracts, and the legal side of raising investment.",
  },
];

export function getAuthorBySlug(slug: string): Author | undefined {
  return authors.find((a) => a.slug === slug);
}
