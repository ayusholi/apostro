import { z } from 'zod';
import { cursorPaginationQuerySchema } from '../../validation/common.schema';

const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9-]+$/, 'Use lowercase letters, numbers, and hyphens only.');

/** `cms.Solicitor.workingHours` — per-day `{start,end}` (DATABASE-DESIGN.md §4.1). */
const dayHoursSchema = z.object({ start: z.string(), end: z.string() }).optional();
export const workingHoursSchema = z.object({
  monday: dayHoursSchema,
  tuesday: dayHoursSchema,
  wednesday: dayHoursSchema,
  thursday: dayHoursSchema,
  friday: dayHoursSchema,
  saturday: dayHoursSchema,
  sunday: dayHoursSchema,
});
export type WorkingHoursInput = z.infer<typeof workingHoursSchema>;

export const createSolicitorSchema = z.object({
  slug: slugSchema,
  name: z.string().trim().min(1).max(200),
  role: z.string().trim().min(1).max(200),
  imageId: z.string().uuid().optional(),
  bio: z.string().trim().min(1),
  qualifications: z.array(z.string().trim().min(1)).default([]),
  memberships: z.array(z.string().trim().min(1)).default([]),
  languages: z.array(z.string().trim().min(1)).default([]),
  experienceYears: z.number().int().nonnegative(),
  email: z.string().trim().toLowerCase().email(),
});
export type CreateSolicitorInput = z.infer<typeof createSolicitorSchema>;

export const updateSolicitorSchema = createSolicitorSchema.partial();
export type UpdateSolicitorInput = z.infer<typeof updateSolicitorSchema>;

export const setRelationSchema = z.object({
  ids: z.array(z.string().uuid()),
});
export type SetRelationInput = z.infer<typeof setRelationSchema>;

export const listSolicitorsQuerySchema = cursorPaginationQuerySchema.extend({
  status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
  q: z.string().trim().min(1).optional(),
});
export type ListSolicitorsQuery = z.infer<typeof listSolicitorsQuerySchema>;

export const listPublicSolicitorsQuerySchema = z.object({
  practiceArea: z.string().trim().min(1).optional(),
  office: z.string().uuid().optional(),
});
export type ListPublicSolicitorsQuery = z.infer<typeof listPublicSolicitorsQuerySchema>;

export const solicitorIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const solicitorSlugParamSchema = z.object({
  slug: z.string().trim().min(1),
});
