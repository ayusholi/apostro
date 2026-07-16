import type { AuthorRepository, CategoryRepository, PostRepository } from "@/application/blog/ports";
import type { PostDetail } from "@/application/blog/dto";
import { computeReadingTime } from "@/domain/blog/readingTime";
import { extractTableOfContents } from "@/domain/blog/tableOfContents";
import { selectRelatedPosts } from "@/domain/blog/relatedPosts";
import { BlogPolicy } from "@/domain/blog/policy";

export function makeGetPostDetail(postRepo: PostRepository, authorRepo: AuthorRepository, categoryRepo: CategoryRepository) {
  return async function getPostDetail(slug: string): Promise<PostDetail | null> {
    const [posts, authors, categories] = await Promise.all([
      postRepo.listAll(),
      authorRepo.listAll(),
      categoryRepo.listAll(),
    ]);

    const post = posts.find((p) => p.slug === slug);
    if (!post) return null;

    const author = authors.find((a) => a.slug === post.authorSlug);
    const category = categories.find((c) => c.slug === post.categorySlug);
    // A post referencing a missing author/category is a data-integrity issue,
    // not a "page doesn't exist" one — but from the visitor's side, both look
    // like "we can't show this page", so this stays null rather than a 500.
    if (!author || !category) return null;

    return {
      post,
      author,
      category,
      readingTime: computeReadingTime(post.body),
      toc: extractTableOfContents(post.body),
      related: selectRelatedPosts(posts, post, BlogPolicy.relatedCount),
    };
  };
}
