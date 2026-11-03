import { z } from 'zod';

/**
 * `.strict()`: an unexpected key — notably a `firmId` — is rejected, not
 * silently ignored. The firm always comes from the verified tenant context.
 */
export const createTaskSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    description: z.string().trim().max(5000).optional(),
    dueAt: z.coerce.date().optional(),
    matterId: z.string().uuid().optional(),
    clientId: z.string().uuid().optional(),
    assigneeMembershipId: z.string().uuid().optional(),
  })
  .strict();
export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const taskIdParamSchema = z.object({ taskId: z.string().uuid() });
