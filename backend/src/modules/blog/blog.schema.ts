import { z } from 'zod';
import {
  offsetPaginationQuerySchema,
  cursorPaginationQuerySchema,
} from '../../validation/common.schema';

const postStatusSchema = z.enum(['DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED']);
const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9-]+$/, 'Use lowercase letters, numbers, and hyphens only.');

export const listPublicPostsQuerySchema = offsetPaginationQuerySchema.extend({
  category: z.string().trim().min(1).optional(),
  tag: z.string().trim().min(1).optional(),
  author: z.string().trim().min(1).optional(),
  q: z.string().trim().min(1).optional(),
});
export type ListPublicPostsQuery = z.infer<typeof listPublicPostsQuerySchema>;

export const postSlugParamSchema = z.object({ slug: z.string().trim().min(1) });
export const categorySlugParamSchema = z.object({ slug: z.string().trim().min(1) });
export const authorSlugParamSchema = z.object({ slug: z.string().trim().min(1) });

export const createPostSchema = z.object({
  slug: slugSchema,
  title: z.string().trim().min(1).max(300),
  excerpt: z.string().trim().min(1).max(500),
  coverImageId: z.string().uuid().optional(),
  categoryId: z.string().uuid(),
  authorId: z.string().uuid(),
  body: z.array(z.record(z.string(), z.unknown())),
  tagIds: z.array(z.string().uuid()).default([]),
});
export type CreatePostInput = z.infer<typeof createPostSchema>;

export const updatePostSchema = createPostSchema.partial();
export type UpdatePostInput = z.infer<typeof updatePostSchema>;

export const publishPostSchema = z.object({
  publishedAt: z.coerce.date().optional(),
});
export type PublishPostInput = z.infer<typeof publishPostSchema>;

export const listAdminPostsQuerySchema = cursorPaginationQuerySchema.extend({
  status: postStatusSchema.optional(),
  category: z.string().trim().min(1).optional(),
  author: z.string().trim().min(1).optional(),
  q: z.string().trim().min(1).optional(),
});
export type ListAdminPostsQuery = z.infer<typeof listAdminPostsQuerySchema>;

export const postIdParamSchema = z.object({ id: z.string().uuid() });

export const categorySchema = z.object({
  slug: slugSchema,
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(1000).optional(),
});
export type CategoryInput = z.infer<typeof categorySchema>;

export const tagSchema = z.object({
  slug: slugSchema,
  name: z.string().trim().min(1).max(200),
});
export type TagInput = z.infer<typeof tagSchema>;

export const authorSchema = z.object({
  slug: slugSchema,
  name: z.string().trim().min(1).max(200),
  role: z.string().trim().min(1).max(200),
  imageId: z.string().uuid().optional(),
  bio: z.string().trim().min(1),
  solicitorId: z.string().uuid().optional(),
});
export type AuthorInput = z.infer<typeof authorSchema>;
