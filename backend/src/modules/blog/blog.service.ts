import { AppError } from '../../shared/errors';
import type {
  AuthorInput,
  CategoryInput,
  CreatePostInput,
  ListAdminPostsQuery,
  ListPublicPostsQuery,
  PublishPostInput,
  TagInput,
  UpdatePostInput,
} from './blog.schema';

/**
 * Blog — posts, categories, tags, authors (API-DESIGN.md §10, DATABASE-
 * DESIGN.md §4.2). Not implemented yet — `cms.BlogPost` and friends have no
 * Prisma model. Public reads use offset pagination (SEO, §0.3); admin uses
 * cursor.
 */

// ── Posts — public ──────────────────────────────────────────────────────

export async function listPublicPosts(_query: ListPublicPostsQuery): Promise<never> {
  throw AppError.notImplemented('Listing blog posts is not implemented yet.');
}

export async function getPublicPost(_slug: string): Promise<never> {
  throw AppError.notImplemented('Fetching a blog post is not implemented yet.');
}

export async function listPublicCategories(): Promise<never> {
  throw AppError.notImplemented('Listing blog categories is not implemented yet.');
}

export async function listPublicPostsByCategory(
  _slug: string,
  _query: ListPublicPostsQuery,
): Promise<never> {
  throw AppError.notImplemented('Listing a category’s posts is not implemented yet.');
}

export async function listPublicTags(): Promise<never> {
  throw AppError.notImplemented('Listing blog tags is not implemented yet.');
}

export async function getPublicAuthor(_slug: string): Promise<never> {
  throw AppError.notImplemented('Fetching a blog author is not implemented yet.');
}

// ── Posts — admin ────────────────────────────────────────────────────────

export async function listPostsForAdmin(_query: ListAdminPostsQuery): Promise<never> {
  throw AppError.notImplemented('Listing blog posts is not implemented yet.');
}

export async function createPost(_input: CreatePostInput): Promise<never> {
  throw AppError.notImplemented('Creating a blog post is not implemented yet.');
}

export async function getPostForAdmin(_id: string): Promise<never> {
  throw AppError.notImplemented('Fetching a blog post is not implemented yet.');
}

export async function updatePost(_id: string, _input: UpdatePostInput): Promise<never> {
  throw AppError.notImplemented('Updating a blog post is not implemented yet.');
}

export async function deletePost(_id: string): Promise<never> {
  throw AppError.notImplemented('Deleting a blog post is not implemented yet.');
}

export async function publishPost(_id: string, _input: PublishPostInput): Promise<never> {
  throw AppError.notImplemented('Publishing a blog post is not implemented yet.');
}

export async function unpublishPost(_id: string): Promise<never> {
  throw AppError.notImplemented('Unpublishing a blog post is not implemented yet.');
}

export async function previewPost(_id: string): Promise<never> {
  throw AppError.notImplemented('Previewing a blog post is not implemented yet.');
}

// ── Categories / tags / authors — admin ─────────────────────────────────

export async function listCategoriesForAdmin(): Promise<never> {
  throw AppError.notImplemented('Listing blog categories is not implemented yet.');
}

export async function createCategory(_input: CategoryInput): Promise<never> {
  throw AppError.notImplemented('Creating a blog category is not implemented yet.');
}

export async function updateCategory(_id: string, _input: CategoryInput): Promise<never> {
  throw AppError.notImplemented('Updating a blog category is not implemented yet.');
}

export async function deleteCategory(_id: string): Promise<never> {
  throw AppError.notImplemented('Deleting a blog category is not implemented yet.');
}

export async function listTagsForAdmin(): Promise<never> {
  throw AppError.notImplemented('Listing blog tags is not implemented yet.');
}

export async function createTag(_input: TagInput): Promise<never> {
  throw AppError.notImplemented('Creating a blog tag is not implemented yet.');
}

export async function updateTag(_id: string, _input: TagInput): Promise<never> {
  throw AppError.notImplemented('Updating a blog tag is not implemented yet.');
}

export async function deleteTag(_id: string): Promise<never> {
  throw AppError.notImplemented('Deleting a blog tag is not implemented yet.');
}

export async function listAuthorsForAdmin(): Promise<never> {
  throw AppError.notImplemented('Listing blog authors is not implemented yet.');
}

export async function createAuthor(_input: AuthorInput): Promise<never> {
  throw AppError.notImplemented('Creating a blog author is not implemented yet.');
}

export async function updateAuthor(_id: string, _input: AuthorInput): Promise<never> {
  throw AppError.notImplemented('Updating a blog author is not implemented yet.');
}

export async function deleteAuthor(_id: string): Promise<never> {
  throw AppError.notImplemented('Deleting a blog author is not implemented yet.');
}
