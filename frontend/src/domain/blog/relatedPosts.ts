import type { Post } from "@/domain/blog/Post";

/**
 * Same category scores higher than a shared tag, since two articles about
 * "Family Law" are more useful to cross-link than two that merely happen to
 * share one tag. Ties break by recency. Pure — no repository access here.
 */
export function selectRelatedPosts(all: Post[], current: Post, limit: number): Post[] {
  return all
    .filter((post) => post.slug !== current.slug)
    .map((post) => {
      const sharedTags = post.tags.filter((tag) => current.tags.includes(tag)).length;
      const sameCategory = post.categorySlug === current.categorySlug ? 2 : 0;
      return { post, score: sameCategory + sharedTags };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || b.post.publishedAt.localeCompare(a.post.publishedAt))
    .slice(0, limit)
    .map(({ post }) => post);
}
