import { z } from 'zod';
import { cursorPaginationQuerySchema } from '../../validation/common.schema';

const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9-]+$/, 'Use lowercase letters, numbers, and hyphens only.');

export const createPracticeAreaSchema = z.object({
  slug: slugSchema,
  title: z.string().trim().min(1).max(200),
  summary: z.string().trim().min(1).max(500),
  description: z.string().trim().min(1),
  durationMinutes: z.number().int().positive(),
  iconMediaId: z.string().uuid().optional(),
  heroImageId: z.string().uuid().optional(),
});
export type CreatePracticeAreaInput = z.infer<typeof createPracticeAreaSchema>;

export const updatePracticeAreaSchema = createPracticeAreaSchema.partial();
export type UpdatePracticeAreaInput = z.infer<typeof updatePracticeAreaSchema>;

export const listPracticeAreasQuerySchema = cursorPaginationQuerySchema.extend({
  status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
  includeDeleted: z.coerce.boolean().default(false),
  q: z.string().trim().min(1).optional(),
});
export type ListPracticeAreasQuery = z.infer<typeof listPracticeAreasQuerySchema>;

export const practiceAreaIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const practiceAreaSlugParamSchema = z.object({
  slug: z.string().trim().min(1),
});
