import { z } from 'zod';
import { cursorPaginationQuerySchema } from '../../validation/common.schema';

export const clientIdParamSchema = z.object({ clientId: z.string().uuid() });

export const listClientsQuerySchema = cursorPaginationQuerySchema.omit({ sort: true }).extend({
  status: z.enum(['PROSPECT', 'ACTIVE', 'ARCHIVED']).optional(),
  q: z.string().trim().min(1).max(100).optional(),
});
export type ListClientsQuery = z.infer<typeof listClientsQuerySchema>;
