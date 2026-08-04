import { z } from 'zod';
import { cursorPaginationQuerySchema } from '../../validation/common.schema';

/** `business.ContactEnquiry.status` (DATABASE-DESIGN.md §3.3). */
const enquiryStatusSchema = z.enum(['NEW', 'IN_PROGRESS', 'RESPONDED', 'CLOSED', 'SPAM']);

export const createEnquirySchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().toLowerCase().email(),
  phone: z.string().trim().max(50).optional(),
  subject: z.string().trim().max(200).optional(),
  message: z.string().trim().min(1).max(5000),
  practiceAreaSlug: z.string().trim().min(1).optional(),
  honeypot: z.string().max(0).optional(),
  renderedAtSignature: z.string().min(1),
});
export type CreateEnquiryInput = z.infer<typeof createEnquirySchema>;

export const updateEnquirySchema = z.object({
  status: enquiryStatusSchema.optional(),
  assignedToId: z.string().uuid().nullable().optional(),
});
export type UpdateEnquiryInput = z.infer<typeof updateEnquirySchema>;

export const assignEnquirySchema = z.object({
  assignedToId: z.string().uuid(),
});
export type AssignEnquiryInput = z.infer<typeof assignEnquirySchema>;

export const listEnquiriesQuerySchema = cursorPaginationQuerySchema.extend({
  status: enquiryStatusSchema.optional(),
  assignedToId: z.string().uuid().optional(),
  practiceAreaId: z.string().uuid().optional(),
  source: z.enum(['CONTACT_FORM', 'PHONE', 'REFERRAL']).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  q: z.string().trim().min(1).optional(),
});
export type ListEnquiriesQuery = z.infer<typeof listEnquiriesQuerySchema>;

export const enquiryIdParamSchema = z.object({
  id: z.string().uuid(),
});
