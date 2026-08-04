import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../validation/validate';
import * as controller from './media.controller';
import {
  listMediaQuerySchema,
  mediaIdParamSchema,
  requestUploadSchema,
  updateMediaSchema,
} from './media.schema';

/** `/api/v1/admin/media` (API-DESIGN.md §13) — 🔴 staff-only, public assets only. */
export const adminRouter = Router();

adminRouter.use(authenticate({ allow: ['staff'] }));

adminRouter.post(
  '/uploads',
  authorize('media:create'),
  validate({ body: requestUploadSchema }),
  controller.requestUpload,
);
adminRouter.post(
  '/:id/complete',
  authorize('media:create'),
  validate({ params: mediaIdParamSchema }),
  controller.completeUpload,
);
adminRouter.get(
  '/',
  authorize('media:read'),
  validate({ query: listMediaQuerySchema }),
  controller.listMedia,
);
adminRouter.get(
  '/:id',
  authorize('media:read'),
  validate({ params: mediaIdParamSchema }),
  controller.getMedia,
);
adminRouter.patch(
  '/:id',
  authorize('media:update'),
  validate({ params: mediaIdParamSchema, body: updateMediaSchema }),
  controller.updateMedia,
);
adminRouter.delete(
  '/:id',
  authorize('media:delete'),
  validate({ params: mediaIdParamSchema }),
  controller.deleteMedia,
);
