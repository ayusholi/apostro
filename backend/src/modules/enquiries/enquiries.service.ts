import { AppError } from '../../shared/errors';
import type {
  AssignEnquiryInput,
  CreateEnquiryInput,
  ListEnquiriesQuery,
  UpdateEnquiryInput,
} from './enquiries.schema';

/**
 * Contact-form enquiries: spam-guarded public write, staff triage
 * (API-DESIGN.md §5). Not implemented yet — `business.ContactEnquiry` has
 * no Prisma model yet (DATABASE-DESIGN.md §3.3).
 */

export async function createEnquiry(_input: CreateEnquiryInput): Promise<never> {
  throw AppError.notImplemented('Submitting an enquiry is not implemented yet.');
}

export async function listEnquiries(_query: ListEnquiriesQuery): Promise<never> {
  throw AppError.notImplemented('Listing enquiries is not implemented yet.');
}

export async function getEnquiry(_id: string): Promise<never> {
  throw AppError.notImplemented('Fetching an enquiry is not implemented yet.');
}

export async function updateEnquiry(_id: string, _input: UpdateEnquiryInput): Promise<never> {
  throw AppError.notImplemented('Updating an enquiry is not implemented yet.');
}

export async function assignEnquiry(_id: string, _input: AssignEnquiryInput): Promise<never> {
  throw AppError.notImplemented('Assigning an enquiry is not implemented yet.');
}

export async function deleteEnquiry(_id: string): Promise<never> {
  throw AppError.notImplemented('Deleting an enquiry is not implemented yet.');
}
