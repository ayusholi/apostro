import type { AuthorRepository, PostRepository } from "@/application/blog/ports";
import type { AuthorProfile } from "@/application/blog/dto";
import { sortPostsByNewest } from "@/domain/blog/query";

export function makeGetAuthorProfile(postRepo: PostRepository, authorRepo: AuthorRepository) {
  return async function getAuthorProfile(slug: string): Promise<AuthorProfile | null> {
    const [posts, authors] = await Promise.all([postRepo.listAll(), authorRepo.listAll()]);

    const author = authors.find((a) => a.slug === slug);
    if (!author) return null;

    return {
      author,
      posts: sortPostsByNewest(posts.filter((post) => post.authorSlug === slug)),
    };
  };
}
