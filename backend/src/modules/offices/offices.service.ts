import { AppError } from '../../shared/errors';
import type { ReorderInput } from '../../validation/common.schema';
import type { CreateOfficeInput, ListOfficesQuery, UpdateOfficeInput } from './offices.schema';

/** Office locations (API-DESIGN.md §12, DATABASE-DESIGN.md §4.1). Not implemented yet — `cms.Office` has no Prisma model. */

export async function listPublicOffices(): Promise<never> {
  throw AppError.notImplemented('Listing offices is not implemented yet.');
}

export async function getPublicOffice(_slug: string): Promise<never> {
  throw AppError.notImplemented('Fetching an office is not implemented yet.');
}

export async function listOfficesForAdmin(_query: ListOfficesQuery): Promise<never> {
  throw AppError.notImplemented('Listing offices is not implemented yet.');
}

export async function createOffice(_input: CreateOfficeInput): Promise<never> {
  throw AppError.notImplemented('Creating an office is not implemented yet.');
}

export async function updateOffice(_id: string, _input: UpdateOfficeInput): Promise<never> {
  throw AppError.notImplemented('Updating an office is not implemented yet.');
}

export async function deleteOffice(_id: string): Promise<never> {
  throw AppError.notImplemented('Deleting an office is not implemented yet.');
}

export async function publishOffice(_id: string): Promise<never> {
  throw AppError.notImplemented('Publishing an office is not implemented yet.');
}

export async function unpublishOffice(_id: string): Promise<never> {
  throw AppError.notImplemented('Unpublishing an office is not implemented yet.');
}

export async function reorderOffices(_input: ReorderInput): Promise<never> {
  throw AppError.notImplemented('Reordering offices is not implemented yet.');
}
