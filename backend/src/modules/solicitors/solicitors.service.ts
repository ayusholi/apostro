import { AppError } from '../../shared/errors';
import type { ReorderInput } from '../../validation/common.schema';
import type {
  CreateSolicitorInput,
  ListPublicSolicitorsQuery,
  ListSolicitorsQuery,
  SetRelationInput,
  UpdateSolicitorInput,
  WorkingHoursInput,
} from './solicitors.schema';

/**
 * Solicitor profiles (API-DESIGN.md §7, DATABASE-DESIGN.md §4.1). Not
 * implemented yet — `cms.Solicitor` has no Prisma model.
 */

export async function listPublicSolicitors(_query: ListPublicSolicitorsQuery): Promise<never> {
  throw AppError.notImplemented('Listing solicitors is not implemented yet.');
}

export async function getPublicSolicitor(_slug: string): Promise<never> {
  throw AppError.notImplemented('Fetching a solicitor is not implemented yet.');
}

export async function listSolicitorsForAdmin(_query: ListSolicitorsQuery): Promise<never> {
  throw AppError.notImplemented('Listing solicitors is not implemented yet.');
}

export async function createSolicitor(_input: CreateSolicitorInput): Promise<never> {
  throw AppError.notImplemented('Creating a solicitor is not implemented yet.');
}

export async function getSolicitorForAdmin(_id: string): Promise<never> {
  throw AppError.notImplemented('Fetching a solicitor is not implemented yet.');
}

export async function updateSolicitor(_id: string, _input: UpdateSolicitorInput): Promise<never> {
  throw AppError.notImplemented('Updating a solicitor is not implemented yet.');
}

export async function deleteSolicitor(_id: string): Promise<never> {
  throw AppError.notImplemented('Deleting a solicitor is not implemented yet.');
}

export async function publishSolicitor(_id: string): Promise<never> {
  throw AppError.notImplemented('Publishing a solicitor is not implemented yet.');
}

export async function unpublishSolicitor(_id: string): Promise<never> {
  throw AppError.notImplemented('Unpublishing a solicitor is not implemented yet.');
}

export async function setSolicitorPracticeAreas(
  _id: string,
  _input: SetRelationInput,
): Promise<never> {
  throw AppError.notImplemented('Setting a solicitor’s practice areas is not implemented yet.');
}

export async function setSolicitorOffices(_id: string, _input: SetRelationInput): Promise<never> {
  throw AppError.notImplemented('Setting a solicitor’s offices is not implemented yet.');
}

export async function setSolicitorWorkingHours(
  _id: string,
  _input: WorkingHoursInput,
): Promise<never> {
  throw AppError.notImplemented('Setting a solicitor’s working hours is not implemented yet.');
}

export async function reorderSolicitors(_input: ReorderInput): Promise<never> {
  throw AppError.notImplemented('Reordering solicitors is not implemented yet.');
}
