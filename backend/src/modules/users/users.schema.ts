import { z } from 'zod';
import { cursorPaginationQuerySchema } from '../../validation/common.schema';

/** `identity.User.status` (DATABASE-DESIGN.md §2.1). */
const userStatusSchema = z.enum(['INVITED', 'ACTIVE', 'SUSPENDED', 'DISABLED']);

/** `RoleAssignment.scopeType` (DATABASE-DESIGN.md §2.1). */
const scopeTypeSchema = z.enum(['GLOBAL', 'OFFICE', 'MATTER']);

export const listUsersQuerySchema = cursorPaginationQuerySchema.extend({
  status: userStatusSchema.optional(),
  roleId: z.string().uuid().optional(),
  q: z.string().trim().min(1).optional(),
});
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;

export const createUserSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  fullName: z.string().trim().min(1).max(200),
  roleIds: z.array(z.string().uuid()).min(1),
});
export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  fullName: z.string().trim().min(1).max(200).optional(),
  status: userStatusSchema.optional(),
  solicitorId: z.string().uuid().nullable().optional(),
});
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const assignRoleSchema = z.object({
  roleId: z.string().uuid(),
  scopeType: scopeTypeSchema,
  scopeId: z.string().uuid().optional(),
  expiresAt: z.coerce.date().optional(),
});
export type AssignRoleInput = z.infer<typeof assignRoleSchema>;

export const suspendUserSchema = z.object({
  reason: z.string().trim().min(1).max(1000),
});
export type SuspendUserInput = z.infer<typeof suspendUserSchema>;

export const userIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const userRoleAssignmentParamSchema = z.object({
  id: z.string().uuid(),
  assignmentId: z.string().uuid(),
});
