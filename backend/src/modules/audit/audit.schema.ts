import { z } from 'zod';
import { cursorPaginationQuerySchema } from '../../validation/common.schema';

/** `audit.AuditLog.actorType` / `.outcome` (DATABASE-DESIGN.md §5). */
const actorTypeSchema = z.enum(['STAFF', 'CLIENT', 'SYSTEM', 'ANONYMOUS']);
const outcomeSchema = z.enum(['SUCCESS', 'FAILURE', 'DENIED']);

export const listAuditLogQuerySchema = cursorPaginationQuerySchema.extend({
  actorId: z.string().uuid().optional(),
  actorType: actorTypeSchema.optional(),
  action: z.string().trim().min(1).optional(),
  resourceType: z.string().trim().min(1).optional(),
  resourceId: z.string().trim().min(1).optional(),
  outcome: outcomeSchema.optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});
export type ListAuditLogQuery = z.infer<typeof listAuditLogQuerySchema>;

export const auditLogIdParamSchema = z.object({ id: z.string().uuid() });
