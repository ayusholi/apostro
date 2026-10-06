import type { Author } from "@/domain/blog/Post";

/**
 * Empty until real authors are confirmed. The previous seed data (Wayne
 * Bell, Anne Key, John Doe) were fictional template placeholders — not
 * people who work at the firm — with public, indexable profile pages and
 * "Partner" titles that don't match the firm's actual Director/Solicitor
 * structure. Removed rather than relabelled, since the underlying people
 * don't exist. Add Ugochukwu/Osasere (or real guest authors) here once
 * articles are ready to publish.
 */
export const authors: Author[] = [];

export function getAuthorBySlug(slug: string): Author | undefined {
  return authors.find((a) => a.slug === slug);
}
