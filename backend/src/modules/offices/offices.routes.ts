import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../validation/validate';
import { reorderSchema } from '../../validation/common.schema';
import * as controller from './offices.controller';
import {
  createOfficeSchema,
  listOfficesQuerySchema,
  officeIdParamSchema,
  officeSlugParamSchema,
  updateOfficeSchema,
} from './offices.schema';

/** `/api/v1/public/offices` (API-DESIGN.md §12.1) — 🟢 anonymous, unpaginated. */
export const publicRouter = Router();

publicRouter.get('/', controller.listPublicOffices);
publicRouter.get('/:slug', validate({ params: officeSlugParamSchema }), controller.getPublicOffice);

/** `/api/v1/admin/offices` (API-DESIGN.md §12.2) — 🔴 staff-only. */
export const adminRouter = Router();

adminRouter.use(authenticate({ allow: ['staff'] }));

adminRouter.get(
  '/',
  authorize('content:read'),
  validate({ query: listOfficesQuerySchema }),
  controller.listOfficesForAdmin,
);
adminRouter.post(
  '/',
  authorize('content:create'),
  validate({ body: createOfficeSchema }),
  controller.createOffice,
);
adminRouter.put(
  '/reorder',
  authorize('content:update'),
  validate({ body: reorderSchema }),
  controller.reorderOffices,
);
adminRouter.patch(
  '/:id',
  authorize('content:update'),
  validate({ params: officeIdParamSchema, body: updateOfficeSchema }),
  controller.updateOffice,
);
adminRouter.delete(
  '/:id',
  authorize('content:delete'),
  validate({ params: officeIdParamSchema }),
  controller.deleteOffice,
);
adminRouter.post(
  '/:id/publish',
  authorize('content:publish'),
  validate({ params: officeIdParamSchema }),
  controller.publishOffice,
);
adminRouter.post(
  '/:id/unpublish',
  authorize('content:publish'),
  validate({ params: officeIdParamSchema }),
  controller.unpublishOffice,
);
