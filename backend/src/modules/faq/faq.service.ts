import { AppError } from '../../shared/errors';
import type { ReorderInput } from '../../validation/common.schema';
import type {
  CreateFaqInput,
  ListAdminFaqsQuery,
  ListPublicFaqsQuery,
  UpdateFaqInput,
} from './faq.schema';

/** FAQ entries (API-DESIGN.md §9, DATABASE-DESIGN.md §4.3). Not implemented yet — `cms.Faq` has no Prisma model. */

export async function listPublicFaqs(_query: ListPublicFaqsQuery): Promise<never> {
  throw AppError.notImplemented('Listing FAQs is not implemented yet.');
}

export async function listFaqsForAdmin(_query: ListAdminFaqsQuery): Promise<never> {
  throw AppError.notImplemented('Listing FAQs is not implemented yet.');
}

export async function createFaq(_input: CreateFaqInput): Promise<never> {
  throw AppError.notImplemented('Creating a FAQ is not implemented yet.');
}

export async function updateFaq(_id: string, _input: UpdateFaqInput): Promise<never> {
  throw AppError.notImplemented('Updating a FAQ is not implemented yet.');
}

export async function deleteFaq(_id: string): Promise<never> {
  throw AppError.notImplemented('Deleting a FAQ is not implemented yet.');
}

export async function publishFaq(_id: string): Promise<never> {
  throw AppError.notImplemented('Publishing a FAQ is not implemented yet.');
}

export async function unpublishFaq(_id: string): Promise<never> {
  throw AppError.notImplemented('Unpublishing a FAQ is not implemented yet.');
}

export async function reorderFaqs(_input: ReorderInput): Promise<never> {
  throw AppError.notImplemented('Reordering FAQs is not implemented yet.');
}
