import type { Request, Response } from 'express';
import {
  sendCreated,
  sendNoContent,
  sendOffsetPaginated,
  sendOk,
  sendPaginated,
} from '../../shared/response';
import { getValidated } from '../../validation/validate';
import * as blogService from './blog.service';
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

// ── Posts — public ──────────────────────────────────────────────────────

export async function listPublicPosts(req: Request, res: Response): Promise<void> {
  const query = getValidated<ListPublicPostsQuery>(req, 'query');
  const { data, pagination } = await blogService.listPublicPosts(query);
  sendOffsetPaginated(res, data, pagination);
}

export async function getPublicPost(req: Request, res: Response): Promise<void> {
  const { slug } = getValidated<{ slug: string }>(req, 'params');
  const post = await blogService.getPublicPost(slug);
  sendOk(res, post);
}

export async function listPublicCategories(_req: Request, res: Response): Promise<void> {
  const categories = await blogService.listPublicCategories();
  sendOk(res, categories);
}

export async function listPublicPostsByCategory(req: Request, res: Response): Promise<void> {
  const { slug } = getValidated<{ slug: string }>(req, 'params');
  const query = getValidated<ListPublicPostsQuery>(req, 'query');
  const { data, pagination } = await blogService.listPublicPostsByCategory(slug, query);
  sendOffsetPaginated(res, data, pagination);
}

export async function listPublicTags(_req: Request, res: Response): Promise<void> {
  const tags = await blogService.listPublicTags();
  sendOk(res, tags);
}

export async function getPublicAuthor(req: Request, res: Response): Promise<void> {
  const { slug } = getValidated<{ slug: string }>(req, 'params');
  const author = await blogService.getPublicAuthor(slug);
  sendOk(res, author);
}

// ── Posts — admin ────────────────────────────────────────────────────────

export async function listPostsForAdmin(req: Request, res: Response): Promise<void> {
  const query = getValidated<ListAdminPostsQuery>(req, 'query');
  const { data, pageInfo } = await blogService.listPostsForAdmin(query);
  sendPaginated(res, data, pageInfo);
}

export async function createPost(req: Request, res: Response): Promise<void> {
  const input = getValidated<CreatePostInput>(req, 'body');
  const post = await blogService.createPost(input);
  sendCreated(res, post);
}

export async function getPostForAdmin(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  const post = await blogService.getPostForAdmin(id);
  sendOk(res, post);
}

export async function updatePost(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  const input = getValidated<UpdatePostInput>(req, 'body');
  const post = await blogService.updatePost(id, input);
  sendOk(res, post);
}

export async function deletePost(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  await blogService.deletePost(id);
  sendNoContent(res);
}

export async function publishPost(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  const input = getValidated<PublishPostInput>(req, 'body');
  const post = await blogService.publishPost(id, input);
  sendOk(res, post);
}

export async function unpublishPost(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  const post = await blogService.unpublishPost(id);
  sendOk(res, post);
}

export async function previewPost(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  const post = await blogService.previewPost(id);
  sendOk(res, post);
}

// ── Categories / tags / authors — admin ─────────────────────────────────

export async function listCategoriesForAdmin(_req: Request, res: Response): Promise<void> {
  sendOk(res, await blogService.listCategoriesForAdmin());
}

export async function createCategory(req: Request, res: Response): Promise<void> {
  const input = getValidated<CategoryInput>(req, 'body');
  sendCreated(res, await blogService.createCategory(input));
}

export async function updateCategory(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  const input = getValidated<CategoryInput>(req, 'body');
  sendOk(res, await blogService.updateCategory(id, input));
}

export async function deleteCategory(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  await blogService.deleteCategory(id);
  sendNoContent(res);
}

export async function listTagsForAdmin(_req: Request, res: Response): Promise<void> {
  sendOk(res, await blogService.listTagsForAdmin());
}

export async function createTag(req: Request, res: Response): Promise<void> {
  const input = getValidated<TagInput>(req, 'body');
  sendCreated(res, await blogService.createTag(input));
}

export async function updateTag(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  const input = getValidated<TagInput>(req, 'body');
  sendOk(res, await blogService.updateTag(id, input));
}

export async function deleteTag(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  await blogService.deleteTag(id);
  sendNoContent(res);
}

export async function listAuthorsForAdmin(_req: Request, res: Response): Promise<void> {
  sendOk(res, await blogService.listAuthorsForAdmin());
}

export async function createAuthor(req: Request, res: Response): Promise<void> {
  const input = getValidated<AuthorInput>(req, 'body');
  sendCreated(res, await blogService.createAuthor(input));
}

export async function updateAuthor(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  const input = getValidated<AuthorInput>(req, 'body');
  sendOk(res, await blogService.updateAuthor(id, input));
}

export async function deleteAuthor(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  await blogService.deleteAuthor(id);
  sendNoContent(res);
}
