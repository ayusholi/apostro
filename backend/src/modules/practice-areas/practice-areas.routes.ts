import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../validation/validate';
import { reorderSchema } from '../../validation/common.schema';
import * as controller from './practice-areas.controller';
import {
  createPracticeAreaSchema,
  listPracticeAreasQuerySchema,
  practiceAreaIdParamSchema,
  practiceAreaSlugParamSchema,
  updatePracticeAreaSchema,
} from './practice-areas.schema';

/** `/api/v1/public/practice-areas` (API-DESIGN.md §6.1) — 🟢 anonymous, CDN-cacheable. */
export const publicRouter = Router();

publicRouter.get('/', controller.listPublicPracticeAreas);
publicRouter.get(
  '/:slug',
  validate({ params: practiceAreaSlugParamSchema }),
  controller.getPublicPracticeArea,
);

/** `/api/v1/admin/practice-areas` (API-DESIGN.md §6.2) — 🔴 staff-only. */
export const adminRouter = Router();

adminRouter.use(authenticate({ allow: ['staff'] }));

adminRouter.get(
  '/',
  authorize('content:read'),
  validate({ query: listPracticeAreasQuerySchema }),
  controller.listPracticeAreasForAdmin,
);
adminRouter.post(
  '/',
  authorize('content:create'),
  validate({ body: createPracticeAreaSchema }),
  controller.createPracticeArea,
);
adminRouter.put(
  '/reorder',
  authorize('content:update'),
  validate({ body: reorderSchema }),
  controller.reorderPracticeAreas,
);
adminRouter.get(
  '/:id',
  authorize('content:read'),
  validate({ params: practiceAreaIdParamSchema }),
  controller.getPracticeAreaForAdmin,
);
adminRouter.patch(
  '/:id',
  authorize('content:update'),
  validate({ params: practiceAreaIdParamSchema, body: updatePracticeAreaSchema }),
  controller.updatePracticeArea,
);
adminRouter.delete(
  '/:id',
  authorize('content:delete'),
  validate({ params: practiceAreaIdParamSchema }),
  controller.deletePracticeArea,
);
adminRouter.post(
  '/:id/publish',
  authorize('content:publish'),
  validate({ params: practiceAreaIdParamSchema }),
  controller.publishPracticeArea,
);
adminRouter.post(
  '/:id/unpublish',
  authorize('content:publish'),
  validate({ params: practiceAreaIdParamSchema }),
  controller.unpublishPracticeArea,
);
