import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../validation/validate';
import * as controller from './roles.controller';
import {
  createRoleSchema,
  roleIdParamSchema,
  setPermissionsSchema,
  updateRoleSchema,
} from './roles.schema';

/** `/api/v1/admin/roles` (API-DESIGN.md §3), all routes 🔴 staff-only. */
export const adminRouter = Router();

adminRouter.use(authenticate({ allow: ['staff'] }));

adminRouter.get('/', authorize('role:read'), controller.listRoles);
adminRouter.post(
  '/',
  authorize('role:create'),
  validate({ body: createRoleSchema }),
  controller.createRole,
);
adminRouter.get(
  '/:id',
  authorize('role:read'),
  validate({ params: roleIdParamSchema }),
  controller.getRole,
);
adminRouter.patch(
  '/:id',
  authorize('role:update'),
  validate({ params: roleIdParamSchema, body: updateRoleSchema }),
  controller.updateRole,
);
adminRouter.put(
  '/:id/permissions',
  authorize('role:update'),
  validate({ params: roleIdParamSchema, body: setPermissionsSchema }),
  controller.setRolePermissions,
);
adminRouter.delete(
  '/:id',
  authorize('role:delete'),
  validate({ params: roleIdParamSchema }),
  controller.deleteRole,
);

/** `/api/v1/admin/permissions` — the catalog for the role editor (API-DESIGN.md §3), 🔴 staff-only. */
export const permissionsRouter = Router();

permissionsRouter.use(authenticate({ allow: ['staff'] }));
permissionsRouter.get('/', authorize('role:read'), controller.listPermissions);
