import type { Author, Category, Post } from "@/domain/blog/Post";

/**
 * Read-only today (static/in-memory data). Every one of these is shaped so a
 * future CMS-backed adapter (Contentful, Sanity, a headless WordPress, or a
 * Postgres table) is a drop-in swap in blogContainer.ts — no use case or
 * component ever imports a concrete adapter directly.
 */
export interface PostRepository {
  listAll(): Promise<Post[]>;
}

export interface AuthorRepository {
  listAll(): Promise<Author[]>;
}

export interface CategoryRepository {
  listAll(): Promise<Category[]>;
}
