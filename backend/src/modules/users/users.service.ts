import { AppError } from '../../shared/errors';
import type {
  AssignRoleInput,
  CreateUserInput,
  ListUsersQuery,
  SuspendUserInput,
  UpdateUserInput,
} from './users.schema';

/**
 * Business logic for staff account management (API-DESIGN.md §2,
 * FOLDER-STRUCTURE.md `users` module). Not implemented yet — there's no
 * `identity.Role`/`RoleAssignment` Prisma schema for this to sit on top of;
 * `auth.repository.ts`'s `User` model covers login only. Routing,
 * validation, and authorization are wired end-to-end below so the module
 * boundary is real; only the persistence + rules are pending.
 */

export async function listUsers(_query: ListUsersQuery): Promise<never> {
  throw AppError.notImplemented('User listing is not implemented yet.');
}

export async function createUser(_input: CreateUserInput): Promise<never> {
  throw AppError.notImplemented('User invitation is not implemented yet.');
}

export async function getUser(_id: string): Promise<never> {
  throw AppError.notImplemented('Fetching a user is not implemented yet.');
}

export async function updateUser(_id: string, _input: UpdateUserInput): Promise<never> {
  throw AppError.notImplemented('Updating a user is not implemented yet.');
}

export async function deleteUser(_id: string): Promise<never> {
  throw AppError.notImplemented('Deleting a user is not implemented yet.');
}

export async function assignRole(_userId: string, _input: AssignRoleInput): Promise<never> {
  throw AppError.notImplemented('Role assignment is not implemented yet.');
}

export async function revokeRoleAssignment(_userId: string, _assignmentId: string): Promise<never> {
  throw AppError.notImplemented('Revoking a role assignment is not implemented yet.');
}

export async function suspendUser(_id: string, _input: SuspendUserInput): Promise<never> {
  throw AppError.notImplemented('Suspending a user is not implemented yet.');
}

export async function reactivateUser(_id: string): Promise<never> {
  throw AppError.notImplemented('Reactivating a user is not implemented yet.');
}

export async function listUserSessions(_id: string): Promise<never> {
  throw AppError.notImplemented('Listing a user’s sessions is not implemented yet.');
}

export async function revokeAllUserSessions(_id: string): Promise<never> {
  throw AppError.notImplemented('Force-logging-out a user is not implemented yet.');
}
