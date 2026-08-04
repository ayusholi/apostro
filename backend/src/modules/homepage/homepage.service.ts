import { AppError } from '../../shared/errors';
import type { ReorderInput } from '../../validation/common.schema';
import type { FirmStatInput, FirmValueInput, UpdateSectionInput } from './homepage.schema';

/**
 * Homepage sections, firm values, firm stats (API-DESIGN.md §11, DATABASE-
 * DESIGN.md §4.2). Not implemented yet — `cms.HomepageSection`/`FirmValue`/
 * `FirmStat` have no Prisma model.
 */

export async function getPublicHomepage(): Promise<never> {
  throw AppError.notImplemented('Fetching the homepage is not implemented yet.');
}

export async function listSections(): Promise<never> {
  throw AppError.notImplemented('Listing homepage sections is not implemented yet.');
}

export async function updateSection(_id: string, _input: UpdateSectionInput): Promise<never> {
  throw AppError.notImplemented('Updating a homepage section is not implemented yet.');
}

export async function reorderSections(_input: ReorderInput): Promise<never> {
  throw AppError.notImplemented('Reordering homepage sections is not implemented yet.');
}

export async function listFirmValues(): Promise<never> {
  throw AppError.notImplemented('Listing firm values is not implemented yet.');
}

export async function createFirmValue(_input: FirmValueInput): Promise<never> {
  throw AppError.notImplemented('Creating a firm value is not implemented yet.');
}

export async function updateFirmValue(_id: string, _input: FirmValueInput): Promise<never> {
  throw AppError.notImplemented('Updating a firm value is not implemented yet.');
}

export async function deleteFirmValue(_id: string): Promise<never> {
  throw AppError.notImplemented('Deleting a firm value is not implemented yet.');
}

export async function reorderFirmValues(_input: ReorderInput): Promise<never> {
  throw AppError.notImplemented('Reordering firm values is not implemented yet.');
}

export async function listFirmStats(): Promise<never> {
  throw AppError.notImplemented('Listing firm stats is not implemented yet.');
}

export async function createFirmStat(_input: FirmStatInput): Promise<never> {
  throw AppError.notImplemented('Creating a firm stat is not implemented yet.');
}

export async function updateFirmStat(_id: string, _input: FirmStatInput): Promise<never> {
  throw AppError.notImplemented('Updating a firm stat is not implemented yet.');
}

export async function deleteFirmStat(_id: string): Promise<never> {
  throw AppError.notImplemented('Deleting a firm stat is not implemented yet.');
}

export async function reorderFirmStats(_input: ReorderInput): Promise<never> {
  throw AppError.notImplemented('Reordering firm stats is not implemented yet.');
}
