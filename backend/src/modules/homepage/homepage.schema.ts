import { z } from 'zod';

/** `cms.HomepageSection.type` (DATABASE-DESIGN.md §4.2). */
export const sectionTypeSchema = z.enum([
  'HERO',
  'STATS',
  'VALUES',
  'FEATURED_REVIEWS',
  'CTA',
  'SERVICES',
  'ABOUT',
]);

export const updateSectionSchema = z.object({
  title: z.string().trim().max(300).optional(),
  subtitle: z.string().trim().max(500).optional(),
  content: z.record(z.string(), z.unknown()).optional(),
  isPublished: z.boolean().optional(),
});
export type UpdateSectionInput = z.infer<typeof updateSectionSchema>;

export const sectionIdParamSchema = z.object({ id: z.string().uuid() });

export const firmValueSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(1000),
  iconPath: z.string().trim().max(500).optional(),
});
export type FirmValueInput = z.infer<typeof firmValueSchema>;

export const firmStatSchema = z.object({
  label: z.string().trim().min(1).max(200),
  value: z.string().trim().min(1).max(50),
  suffix: z.string().trim().max(20).optional(),
});
export type FirmStatInput = z.infer<typeof firmStatSchema>;
