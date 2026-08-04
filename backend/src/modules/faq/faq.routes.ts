import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../validation/validate';
import { reorderSchema } from '../../validation/common.schema';
import * as controller from './faq.controller';
import {
  createFaqSchema,
  faqIdParamSchema,
  listAdminFaqsQuerySchema,
  listPublicFaqsQuerySchema,
  updateFaqSchema,
} from './faq.schema';

/** `/api/v1/public/faqs` (API-DESIGN.md §9.1) — 🟢 anonymous. */
export const publicRouter = Router();

publicRouter.get('/', validate({ query: listPublicFaqsQuerySchema }), controller.listPublicFaqs);

/** `/api/v1/admin/faqs` (API-DESIGN.md §9.2) — 🔴 staff-only. */
export const adminRouter = Router();

adminRouter.use(authenticate({ allow: ['staff'] }));

adminRouter.get(
  '/',
  authorize('content:read'),
  validate({ query: listAdminFaqsQuerySchema }),
  controller.listFaqsForAdmin,
);
adminRouter.post(
  '/',
  authorize('content:create'),
  validate({ body: createFaqSchema }),
  controller.createFaq,
);
adminRouter.put(
  '/reorder',
  authorize('content:update'),
  validate({ body: reorderSchema }),
  controller.reorderFaqs,
);
adminRouter.patch(
  '/:id',
  authorize('content:update'),
  validate({ params: faqIdParamSchema, body: updateFaqSchema }),
  controller.updateFaq,
);
adminRouter.delete(
  '/:id',
  authorize('content:delete'),
  validate({ params: faqIdParamSchema }),
  controller.deleteFaq,
);
adminRouter.post(
  '/:id/publish',
  authorize('content:publish'),
  validate({ params: faqIdParamSchema }),
  controller.publishFaq,
);
adminRouter.post(
  '/:id/unpublish',
  authorize('content:publish'),
  validate({ params: faqIdParamSchema }),
  controller.unpublishFaq,
);
