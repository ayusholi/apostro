import { z } from 'zod';

const firmRoleSchema = z.enum(['OWNER', 'ADMIN', 'FEE_EARNER', 'SUPPORT']);

/** Lowercased here, like auth.schema.ts, so it compares exactly with User.email. */
const emailSchema = z.string().trim().toLowerCase().email('Enter a valid email address.');

export const membershipIdParamSchema = z.object({ membershipId: z.string().uuid() });
export const invitationIdParamSchema = z.object({ invitationId: z.string().uuid() });

export const listMembersQuerySchema = z.object({
  /** Omitted: everyone except removed members. */
  status: z.enum(['ACTIVE', 'SUSPENDED', 'REMOVED']).optional(),
});
export type ListMembersQuery = z.infer<typeof listMembersQuerySchema>;

/** Removal is its own endpoint (DELETE), so `status` here only toggles suspension. */
export const updateMemberSchema = z
  .object({
    role: firmRoleSchema.optional(),
    status: z.enum(['ACTIVE', 'SUSPENDED']).optional(),
  })
  .strict()
  .refine((v) => v.role !== undefined || v.status !== undefined, {
    message: 'Provide a role or a status.',
  });
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;

export const createInvitationSchema = z
  .object({ email: emailSchema, role: firmRoleSchema })
  .strict();
export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;

export const acceptInvitationSchema = z.object({ token: z.string().min(1).max(200) }).strict();
export type AcceptInvitationInput = z.infer<typeof acceptInvitationSchema>;
