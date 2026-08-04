import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../validation/validate';
import * as controller from './enquiries.controller';
import {
  assignEnquirySchema,
  createEnquirySchema,
  enquiryIdParamSchema,
  listEnquiriesQuerySchema,
  updateEnquirySchema,
} from './enquiries.schema';

/** `/api/v1/public/contact` (API-DESIGN.md §5.1) — 🟢 anonymous, spam-guarded. */
export const publicRouter = Router();

publicRouter.post('/contact', validate({ body: createEnquirySchema }), controller.createEnquiry);

/** `/api/v1/admin/enquiries` (API-DESIGN.md §5.2) — 🔴 staff-only. */
export const adminRouter = Router();

adminRouter.use(authenticate({ allow: ['staff'] }));

adminRouter.get(
  '/',
  authorize('enquiry:read'),
  validate({ query: listEnquiriesQuerySchema }),
  controller.listEnquiries,
);
adminRouter.get(
  '/:id',
  authorize('enquiry:read'),
  validate({ params: enquiryIdParamSchema }),
  controller.getEnquiry,
);
adminRouter.patch(
  '/:id',
  authorize('enquiry:update'),
  validate({ params: enquiryIdParamSchema, body: updateEnquirySchema }),
  controller.updateEnquiry,
);
adminRouter.post(
  '/:id/assign',
  authorize('enquiry:update'),
  validate({ params: enquiryIdParamSchema, body: assignEnquirySchema }),
  controller.assignEnquiry,
);
adminRouter.delete(
  '/:id',
  authorize('enquiry:delete'),
  validate({ params: enquiryIdParamSchema }),
  controller.deleteEnquiry,
);
