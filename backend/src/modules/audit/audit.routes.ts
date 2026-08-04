import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../validation/validate';
import * as controller from './audit.controller';
import { auditLogIdParamSchema, listAuditLogQuerySchema } from './audit.schema';

/** `/api/v1/admin/audit` (API-DESIGN.md §16) — 🔴 staff-only, read-only, no write endpoints by design. */
export const adminRouter = Router();

adminRouter.use(authenticate({ allow: ['staff'] }));

adminRouter.get(
  '/',
  authorize('audit:read'),
  validate({ query: listAuditLogQuerySchema }),
  controller.listAuditLog,
);
adminRouter.get(
  '/:id',
  authorize('audit:read'),
  validate({ params: auditLogIdParamSchema }),
  controller.getAuditLogEntry,
);
