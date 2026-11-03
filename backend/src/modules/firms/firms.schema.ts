import { z } from 'zod';

/** Same shape the `Firm_slug_format_check` constraint enforces. */
export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const createFirmSchema = z
  .object({
    name: z.string().trim().min(1).max(200),
    /** Optional; derived from the name when omitted. */
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .min(2)
      .max(60)
      .regex(SLUG_PATTERN, 'Use lowercase letters, numbers and single hyphens.')
      .optional(),
  })
  .strict();
export type CreateFirmInput = z.infer<typeof createFirmSchema>;
