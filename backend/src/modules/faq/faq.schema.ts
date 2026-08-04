import { z } from 'zod';
import { cursorPaginationQuerySchema } from '../../validation/common.schema';

export const createFaqSchema = z.object({
  question: z.string().trim().min(1).max(500),
  answer: z.string().trim().min(1),
  practiceAreaId: z.string().uuid().optional(),
});
export type CreateFaqInput = z.infer<typeof createFaqSchema>;

export const updateFaqSchema = createFaqSchema.partial();
export type UpdateFaqInput = z.infer<typeof updateFaqSchema>;

export const listPublicFaqsQuerySchema = z.object({
  practiceArea: z.string().trim().min(1).optional(),
});
export type ListPublicFaqsQuery = z.infer<typeof listPublicFaqsQuerySchema>;

export const listAdminFaqsQuerySchema = cursorPaginationQuerySchema.extend({
  practiceAreaId: z.string().uuid().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
  q: z.string().trim().min(1).optional(),
});
export type ListAdminFaqsQuery = z.infer<typeof listAdminFaqsQuerySchema>;

export const faqIdParamSchema = z.object({
  id: z.string().uuid(),
});
