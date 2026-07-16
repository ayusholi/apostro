import type { Author, Category, Post } from "@/domain/blog/Post";
import type { BlogFilter } from "@/domain/blog/query";
import type { TocEntry } from "@/domain/blog/tableOfContents";

export type ListPostsInput = {
  filter: BlogFilter;
  page: number;
};

export type ListPostsOutput = {
  posts: Post[];
  page: number;
  pageCount: number;
  totalMatching: number;
  /** Every category, with a count of posts matching the CURRENT filter minus its own category — the toolbar's option list, unaffected by which category is selected. */
  categories: { category: Category; count: number }[];
  /** Every tag slug used across all posts, for the tag filter dropdown. */
  tags: string[];
};

export type PostDetail = {
  post: Post;
  author: Author;
  category: Category;
  readingTime: number;
  toc: TocEntry[];
  related: Post[];
};

export type AuthorProfile = {
  author: Author;
  posts: Post[];
};
