import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../validation/validate';
import { reorderSchema } from '../../validation/common.schema';
import * as controller from './solicitors.controller';
import {
  createSolicitorSchema,
  listPublicSolicitorsQuerySchema,
  listSolicitorsQuerySchema,
  setRelationSchema,
  solicitorIdParamSchema,
  solicitorSlugParamSchema,
  updateSolicitorSchema,
  workingHoursSchema,
} from './solicitors.schema';

/** `/api/v1/public/solicitors` (API-DESIGN.md §7.1) — 🟢 anonymous. */
export const publicRouter = Router();

publicRouter.get(
  '/',
  validate({ query: listPublicSolicitorsQuerySchema }),
  controller.listPublicSolicitors,
);
publicRouter.get(
  '/:slug',
  validate({ params: solicitorSlugParamSchema }),
  controller.getPublicSolicitor,
);

/** `/api/v1/admin/solicitors` (API-DESIGN.md §7.2) — 🔴 staff-only. */
export const adminRouter = Router();

adminRouter.use(authenticate({ allow: ['staff'] }));

adminRouter.get(
  '/',
  authorize('content:read'),
  validate({ query: listSolicitorsQuerySchema }),
  controller.listSolicitorsForAdmin,
);
adminRouter.post(
  '/',
  authorize('content:create'),
  validate({ body: createSolicitorSchema }),
  controller.createSolicitor,
);
adminRouter.put(
  '/reorder',
  authorize('content:update'),
  validate({ body: reorderSchema }),
  controller.reorderSolicitors,
);
adminRouter.get(
  '/:id',
  authorize('content:read'),
  validate({ params: solicitorIdParamSchema }),
  controller.getSolicitorForAdmin,
);
adminRouter.patch(
  '/:id',
  authorize('content:update'),
  validate({ params: solicitorIdParamSchema, body: updateSolicitorSchema }),
  controller.updateSolicitor,
);
adminRouter.delete(
  '/:id',
  authorize('content:delete'),
  validate({ params: solicitorIdParamSchema }),
  controller.deleteSolicitor,
);
adminRouter.post(
  '/:id/publish',
  authorize('content:publish'),
  validate({ params: solicitorIdParamSchema }),
  controller.publishSolicitor,
);
adminRouter.post(
  '/:id/unpublish',
  authorize('content:publish'),
  validate({ params: solicitorIdParamSchema }),
  controller.unpublishSolicitor,
);
adminRouter.put(
  '/:id/practice-areas',
  authorize('content:update'),
  validate({ params: solicitorIdParamSchema, body: setRelationSchema }),
  controller.setSolicitorPracticeAreas,
);
adminRouter.put(
  '/:id/offices',
  authorize('content:update'),
  validate({ params: solicitorIdParamSchema, body: setRelationSchema }),
  controller.setSolicitorOffices,
);
adminRouter.put(
  '/:id/working-hours',
  authorize('content:update'),
  validate({ params: solicitorIdParamSchema, body: workingHoursSchema }),
  controller.setSolicitorWorkingHours,
);
