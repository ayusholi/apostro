import { AppError } from '../../shared/errors';
import type { CreateRoleInput, SetPermissionsInput, UpdateRoleInput } from './roles.schema';

/**
 * Roles & permissions (API-DESIGN.md §3, RBAC-DESIGN.md). Not implemented
 * yet — `shared/permissions.ts` still resolves every user to `[]` until
 * this module's persistence exists and calls `setPermissionResolver(...)`
 * (see that file's header comment).
 */

export async function listRoles(): Promise<never> {
  throw AppError.notImplemented('Listing roles is not implemented yet.');
}

export async function createRole(_input: CreateRoleInput): Promise<never> {
  throw AppError.notImplemented('Creating a role is not implemented yet.');
}

export async function getRole(_id: string): Promise<never> {
  throw AppError.notImplemented('Fetching a role is not implemented yet.');
}

export async function updateRole(_id: string, _input: UpdateRoleInput): Promise<never> {
  throw AppError.notImplemented('Updating a role is not implemented yet.');
}

export async function setRolePermissions(_id: string, _input: SetPermissionsInput): Promise<never> {
  throw AppError.notImplemented('Setting role permissions is not implemented yet.');
}

export async function deleteRole(_id: string): Promise<never> {
  throw AppError.notImplemented('Deleting a role is not implemented yet.');
}

export async function listPermissions(): Promise<never> {
  throw AppError.notImplemented('Listing the permission catalog is not implemented yet.');
}
