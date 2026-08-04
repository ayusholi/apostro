import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../validation/validate';
import { reorderSchema, uuidParamSchema } from '../../validation/common.schema';
import * as controller from './homepage.controller';
import {
  firmStatSchema,
  firmValueSchema,
  sectionIdParamSchema,
  updateSectionSchema,
} from './homepage.schema';

/** `/api/v1/public/homepage` (API-DESIGN.md §11.1) — 🟢 anonymous, one aggregate call, heavily CDN-cached. */
export const publicRouter = Router();

publicRouter.get('/', controller.getPublicHomepage);

/** `/api/v1/admin/homepage/*` (API-DESIGN.md §11.2) — 🔴 staff-only. */
export const adminRouter = Router();

adminRouter.use(authenticate({ allow: ['staff'] }));

adminRouter.get('/sections', authorize('content:read'), controller.listSections);
adminRouter.patch(
  '/sections/:id',
  authorize('content:update'),
  validate({ params: sectionIdParamSchema, body: updateSectionSchema }),
  controller.updateSection,
);
adminRouter.put(
  '/sections/reorder',
  authorize('content:update'),
  validate({ body: reorderSchema }),
  controller.reorderSections,
);

adminRouter.get('/values', authorize('content:read'), controller.listFirmValues);
adminRouter.post(
  '/values',
  authorize('content:create'),
  validate({ body: firmValueSchema }),
  controller.createFirmValue,
);
adminRouter.put(
  '/values/reorder',
  authorize('content:update'),
  validate({ body: reorderSchema }),
  controller.reorderFirmValues,
);
adminRouter.patch(
  '/values/:id',
  authorize('content:update'),
  validate({ params: uuidParamSchema, body: firmValueSchema }),
  controller.updateFirmValue,
);
adminRouter.delete(
  '/values/:id',
  authorize('content:delete'),
  validate({ params: uuidParamSchema }),
  controller.deleteFirmValue,
);

adminRouter.get('/stats', authorize('content:read'), controller.listFirmStats);
adminRouter.post(
  '/stats',
  authorize('content:create'),
  validate({ body: firmStatSchema }),
  controller.createFirmStat,
);
adminRouter.put(
  '/stats/reorder',
  authorize('content:update'),
  validate({ body: reorderSchema }),
  controller.reorderFirmStats,
);
adminRouter.patch(
  '/stats/:id',
  authorize('content:update'),
  validate({ params: uuidParamSchema, body: firmStatSchema }),
  controller.updateFirmStat,
);
adminRouter.delete(
  '/stats/:id',
  authorize('content:delete'),
  validate({ params: uuidParamSchema }),
  controller.deleteFirmStat,
);
