import { z } from 'zod';

export const createRoleSchema = z.object({
  key: z.string().trim().toUpperCase().min(1).max(50),
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(1000).optional(),
  permissionIds: z.array(z.string().uuid()).default([]),
});
export type CreateRoleInput = z.infer<typeof createRoleSchema>;

export const updateRoleSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(1000).optional(),
});
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;

export const setPermissionsSchema = z.object({
  permissionIds: z.array(z.string().uuid()),
});
export type SetPermissionsInput = z.infer<typeof setPermissionsSchema>;

export const roleIdParamSchema = z.object({
  id: z.string().uuid(),
});
