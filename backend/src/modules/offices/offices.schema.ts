import { z } from 'zod';
import { cursorPaginationQuerySchema } from '../../validation/common.schema';

const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9-]+$/, 'Use lowercase letters, numbers, and hyphens only.');

/** `cms.Office.openingHours` — per-day `{open,close}` (DATABASE-DESIGN.md §4.1). */
const dayHoursSchema = z.object({ open: z.string(), close: z.string() }).optional();
const openingHoursSchema = z.object({
  monday: dayHoursSchema,
  tuesday: dayHoursSchema,
  wednesday: dayHoursSchema,
  thursday: dayHoursSchema,
  friday: dayHoursSchema,
  saturday: dayHoursSchema,
  sunday: dayHoursSchema,
});

export const createOfficeSchema = z.object({
  slug: slugSchema,
  name: z.string().trim().min(1).max(200),
  addressLine1: z.string().trim().min(1).max(300),
  addressLine2: z.string().trim().max(300).optional(),
  city: z.string().trim().min(1).max(200),
  postcode: z.string().trim().min(1).max(20),
  country: z.string().trim().min(1).max(100),
  timeZone: z.string().trim().min(1),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  phone: z.string().trim().max(50).optional(),
  email: z.string().trim().toLowerCase().email().optional(),
  openingHours: openingHoursSchema,
});
export type CreateOfficeInput = z.infer<typeof createOfficeSchema>;

export const updateOfficeSchema = createOfficeSchema.partial();
export type UpdateOfficeInput = z.infer<typeof updateOfficeSchema>;

export const listOfficesQuerySchema = cursorPaginationQuerySchema.extend({
  q: z.string().trim().min(1).optional(),
});
export type ListOfficesQuery = z.infer<typeof listOfficesQuerySchema>;

export const officeIdParamSchema = z.object({ id: z.string().uuid() });
export const officeSlugParamSchema = z.object({ slug: z.string().trim().min(1) });
