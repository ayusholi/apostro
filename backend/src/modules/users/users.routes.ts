import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../validation/validate';
import * as controller from './users.controller';
import {
  assignRoleSchema,
  createUserSchema,
  listUsersQuerySchema,
  suspendUserSchema,
  updateUserSchema,
  userIdParamSchema,
  userRoleAssignmentParamSchema,
} from './users.schema';

/** Staff account management — `/api/v1/admin/users` (API-DESIGN.md §2), all routes 🔴 staff-only. */
export const adminRouter = Router();

adminRouter.use(authenticate({ allow: ['staff'] }));

adminRouter.get(
  '/',
  authorize('user:read'),
  validate({ query: listUsersQuerySchema }),
  controller.listUsers,
);
adminRouter.post(
  '/',
  authorize('user:create'),
  validate({ body: createUserSchema }),
  controller.createUser,
);
adminRouter.get(
  '/:id',
  authorize('user:read'),
  validate({ params: userIdParamSchema }),
  controller.getUser,
);
adminRouter.patch(
  '/:id',
  authorize('user:update'),
  validate({ params: userIdParamSchema, body: updateUserSchema }),
  controller.updateUser,
);
adminRouter.delete(
  '/:id',
  authorize('user:delete'),
  validate({ params: userIdParamSchema }),
  controller.deleteUser,
);

adminRouter.post(
  '/:id/roles',
  authorize('user:manage-roles'),
  validate({ params: userIdParamSchema, body: assignRoleSchema }),
  controller.assignRole,
);
adminRouter.delete(
  '/:id/roles/:assignmentId',
  authorize('user:manage-roles'),
  validate({ params: userRoleAssignmentParamSchema }),
  controller.revokeRoleAssignment,
);

adminRouter.post(
  '/:id/suspend',
  authorize('user:update'),
  validate({ params: userIdParamSchema, body: suspendUserSchema }),
  controller.suspendUser,
);
adminRouter.post(
  '/:id/reactivate',
  authorize('user:update'),
  validate({ params: userIdParamSchema }),
  controller.reactivateUser,
);

adminRouter.get(
  '/:id/sessions',
  authorize('user:read'),
  validate({ params: userIdParamSchema }),
  controller.listUserSessions,
);
adminRouter.delete(
  '/:id/sessions',
  authorize('user:manage-roles'),
  validate({ params: userIdParamSchema }),
  controller.revokeAllUserSessions,
);
