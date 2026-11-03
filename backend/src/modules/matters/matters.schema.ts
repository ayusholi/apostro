import { z } from 'zod';

export const matterIdParamSchema = z.object({ matterId: z.string().uuid() });

export const listMatterTasksQuerySchema = z.object({
  status: z.enum(['OPEN', 'DONE', 'CANCELLED']).default('OPEN'),
});
export type ListMatterTasksQuery = z.infer<typeof listMatterTasksQuerySchema>;

export const listActivityQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(25),
});
export type ListActivityQuery = z.infer<typeof listActivityQuerySchema>;
