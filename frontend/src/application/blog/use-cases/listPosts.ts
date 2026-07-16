import type { PostRepository, CategoryRepository } from "@/application/blog/ports";
import type { ListPostsInput, ListPostsOutput } from "@/application/blog/dto";
import { queryPosts } from "@/domain/blog/query";
import { BlogPolicy } from "@/domain/blog/policy";

export function makeListPosts(postRepo: PostRepository, categoryRepo: CategoryRepository) {
  return async function listPosts(input: ListPostsInput): Promise<ListPostsOutput> {
    const [allPosts, allCategories] = await Promise.all([postRepo.listAll(), categoryRepo.listAll()]);

    const result = queryPosts(allPosts, {
      filter: input.filter,
      page: input.page,
      pageSize: BlogPolicy.pageSize,
    });

    // Counts and the tag list are always computed over ALL posts, not the
    // filtered set, so the toolbar's options don't shrink as you narrow a
    // search — the same reasoning as reviews' overallStats.
    const categories = allCategories.map((category) => ({
      category,
      count: allPosts.filter((post) => post.categorySlug === category.slug).length,
    }));
    const tags = Array.from(new Set(allPosts.flatMap((post) => post.tags))).sort();

    return {
      posts: result.items,
      page: result.page,
      pageCount: result.pageCount,
      totalMatching: result.total,
      categories,
      tags,
    };
  };
}
