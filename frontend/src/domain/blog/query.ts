import type { Post } from "@/domain/blog/Post";

export type BlogFilter = {
  categorySlug?: string;
  tag?: string;
  /** Free-text search against title, excerpt, and tags. */
  query?: string;
};

export type BlogQuery = {
  filter: BlogFilter;
  page: number;
  pageSize: number;
};

export type BlogQueryResult = {
  items: Post[];
  total: number;
  page: number;
  pageCount: number;
};

function matchesSearch(post: Post, query: string): boolean {
  const haystack = `${post.title} ${post.excerpt} ${post.tags.join(" ")}`.toLowerCase();
  return haystack.includes(query.toLowerCase().trim());
}

export function filterPosts(posts: Post[], filter: BlogFilter): Post[] {
  return posts.filter((post) => {
    if (filter.categorySlug && post.categorySlug !== filter.categorySlug) return false;
    if (filter.tag && !post.tags.includes(filter.tag)) return false;
    if (filter.query?.trim() && !matchesSearch(post, filter.query)) return false;
    return true;
  });
}

export function sortPostsByNewest(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

/** Pure filter (incl. search) → sort → paginate pipeline, mirroring domain/reviews/query.ts. */
export function queryPosts(posts: Post[], query: BlogQuery): BlogQueryResult {
  const filtered = sortPostsByNewest(filterPosts(posts, query.filter));

  const pageCount = Math.max(1, Math.ceil(filtered.length / query.pageSize));
  const page = Math.min(Math.max(1, query.page), pageCount);
  const start = (page - 1) * query.pageSize;

  return {
    items: filtered.slice(start, start + query.pageSize),
    total: filtered.length,
    page,
    pageCount,
  };
}
