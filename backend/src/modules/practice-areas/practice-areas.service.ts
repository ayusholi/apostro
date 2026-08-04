import { AppError } from '../../shared/errors';
import type { ReorderInput } from '../../validation/common.schema';
import type {
  CreatePracticeAreaInput,
  ListPracticeAreasQuery,
  UpdatePracticeAreaInput,
} from './practice-areas.schema';

/**
 * Practice areas — the domain's `Service` (API-DESIGN.md §6, DATABASE-
 * DESIGN.md §4.1). Not implemented yet — `cms.PracticeArea` has no Prisma
 * model. Plain CRUD (no repository — FOLDER-STRUCTURE.md §4).
 */

export async function listPublicPracticeAreas(): Promise<never> {
  throw AppError.notImplemented('Listing practice areas is not implemented yet.');
}

export async function getPublicPracticeArea(_slug: string): Promise<never> {
  throw AppError.notImplemented('Fetching a practice area is not implemented yet.');
}

export async function listPracticeAreasForAdmin(_query: ListPracticeAreasQuery): Promise<never> {
  throw AppError.notImplemented('Listing practice areas is not implemented yet.');
}

export async function createPracticeArea(_input: CreatePracticeAreaInput): Promise<never> {
  throw AppError.notImplemented('Creating a practice area is not implemented yet.');
}

export async function getPracticeAreaForAdmin(_id: string): Promise<never> {
  throw AppError.notImplemented('Fetching a practice area is not implemented yet.');
}

export async function updatePracticeArea(
  _id: string,
  _input: UpdatePracticeAreaInput,
): Promise<never> {
  throw AppError.notImplemented('Updating a practice area is not implemented yet.');
}

export async function deletePracticeArea(_id: string): Promise<never> {
  throw AppError.notImplemented('Deleting a practice area is not implemented yet.');
}

export async function publishPracticeArea(_id: string): Promise<never> {
  throw AppError.notImplemented('Publishing a practice area is not implemented yet.');
}

export async function unpublishPracticeArea(_id: string): Promise<never> {
  throw AppError.notImplemented('Unpublishing a practice area is not implemented yet.');
}

export async function reorderPracticeAreas(_input: ReorderInput): Promise<never> {
  throw AppError.notImplemented('Reordering practice areas is not implemented yet.');
}
