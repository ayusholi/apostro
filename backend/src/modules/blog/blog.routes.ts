import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../validation/validate';
import { uuidParamSchema } from '../../validation/common.schema';
import * as controller from './blog.controller';
import {
  authorSchema,
  authorSlugParamSchema,
  categorySchema,
  categorySlugParamSchema,
  createPostSchema,
  listAdminPostsQuerySchema,
  listPublicPostsQuerySchema,
  postIdParamSchema,
  postSlugParamSchema,
  publishPostSchema,
  tagSchema,
  updatePostSchema,
} from './blog.schema';

/** `/api/v1/public/blog/*` (API-DESIGN.md §10.1) — 🟢 anonymous, offset-paginated for SEO. */
export const publicRouter = Router();

publicRouter.get(
  '/posts',
  validate({ query: listPublicPostsQuerySchema }),
  controller.listPublicPosts,
);
publicRouter.get(
  '/posts/:slug',
  validate({ params: postSlugParamSchema }),
  controller.getPublicPost,
);
publicRouter.get('/categories', controller.listPublicCategories);
publicRouter.get(
  '/categories/:slug/posts',
  validate({ params: categorySlugParamSchema, query: listPublicPostsQuerySchema }),
  controller.listPublicPostsByCategory,
);
publicRouter.get('/tags', controller.listPublicTags);
publicRouter.get(
  '/authors/:slug',
  validate({ params: authorSlugParamSchema }),
  controller.getPublicAuthor,
);

/** `/api/v1/admin/blog/*` (API-DESIGN.md §10.2) — 🔴 staff-only. */
export const adminRouter = Router();

adminRouter.use(authenticate({ allow: ['staff'] }));

adminRouter.get(
  '/posts',
  authorize('content:read'),
  validate({ query: listAdminPostsQuerySchema }),
  controller.listPostsForAdmin,
);
adminRouter.post(
  '/posts',
  authorize('content:create'),
  validate({ body: createPostSchema }),
  controller.createPost,
);
adminRouter.get(
  '/posts/:id',
  authorize('content:read'),
  validate({ params: postIdParamSchema }),
  controller.getPostForAdmin,
);
adminRouter.patch(
  '/posts/:id',
  authorize('content:update'),
  validate({ params: postIdParamSchema, body: updatePostSchema }),
  controller.updatePost,
);
adminRouter.delete(
  '/posts/:id',
  authorize('content:delete'),
  validate({ params: postIdParamSchema }),
  controller.deletePost,
);
adminRouter.post(
  '/posts/:id/publish',
  authorize('content:publish'),
  validate({ params: postIdParamSchema, body: publishPostSchema }),
  controller.publishPost,
);
adminRouter.post(
  '/posts/:id/unpublish',
  authorize('content:publish'),
  validate({ params: postIdParamSchema }),
  controller.unpublishPost,
);
adminRouter.get(
  '/posts/:id/preview',
  authorize('content:read'),
  validate({ params: postIdParamSchema }),
  controller.previewPost,
);

adminRouter.get('/categories', authorize('content:read'), controller.listCategoriesForAdmin);
adminRouter.post(
  '/categories',
  authorize('content:create'),
  validate({ body: categorySchema }),
  controller.createCategory,
);
adminRouter.patch(
  '/categories/:id',
  authorize('content:update'),
  validate({ params: uuidParamSchema, body: categorySchema }),
  controller.updateCategory,
);
adminRouter.delete(
  '/categories/:id',
  authorize('content:delete'),
  validate({ params: uuidParamSchema }),
  controller.deleteCategory,
);

adminRouter.get('/tags', authorize('content:read'), controller.listTagsForAdmin);
adminRouter.post(
  '/tags',
  authorize('content:create'),
  validate({ body: tagSchema }),
  controller.createTag,
);
adminRouter.patch(
  '/tags/:id',
  authorize('content:update'),
  validate({ params: uuidParamSchema, body: tagSchema }),
  controller.updateTag,
);
adminRouter.delete(
  '/tags/:id',
  authorize('content:delete'),
  validate({ params: uuidParamSchema }),
  controller.deleteTag,
);

adminRouter.get('/authors', authorize('content:read'), controller.listAuthorsForAdmin);
adminRouter.post(
  '/authors',
  authorize('content:create'),
  validate({ body: authorSchema }),
  controller.createAuthor,
);
adminRouter.patch(
  '/authors/:id',
  authorize('content:update'),
  validate({ params: uuidParamSchema, body: authorSchema }),
  controller.updateAuthor,
);
adminRouter.delete(
  '/authors/:id',
  authorize('content:delete'),
  validate({ params: uuidParamSchema }),
  controller.deleteAuthor,
);
