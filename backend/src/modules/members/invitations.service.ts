import { prisma } from '../../db/prisma';
import { generateOpaqueToken, sha256Hex } from '../../shared/crypto';
import { AppError } from '../../shared/errors';
import { recordAuditInTransaction } from '../audit/audit.writer';
import { getEmailSender } from '../auth/ports';
import { forTenant } from '../tenancy/tenantPrisma';
import type { TenantContext } from '../tenancy/tenancy.types';
import { assertCanGrantRole } from './members.rules';
import type { CreateInvitationInput } from './members.schema';
import { lockFirmForMembershipChange, memberView } from './members.service';

export const INVITATION_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

const invitationView = {
  id: true,
  email: true,
  role: true,
  expiresAt: true,
  createdAt: true,
  invitedBy: { select: { id: true, user: { select: { fullName: true } } } },
} as const;

const alreadyMember = () =>
  new AppError({
    status: 409,
    code: 'ALREADY_MEMBER',
    detail: 'This person is already a member of the firm.',
  });

/** Same answer for unknown, used, revoked and expired tokens. */
const invalidInvitation = () =>
  new AppError({
    status: 400,
    code: 'INVALID_OR_EXPIRED_TOKEN',
    detail: 'This invitation is invalid or has expired.',
  });

/**
 * Invites an email address to the firm with a role. Re-inviting the same
 * address revokes the earlier invitation, so only the newest link works.
 * The email goes out after commit; if it fails, inviting again issues a
 * fresh link.
 */
export async function createInvitation(ctx: TenantContext, input: CreateInvitationInput) {
  const rawToken = generateOpaqueToken();

  const invitation = await forTenant(ctx).$transaction(async (tx) => {
    const actor = await lockFirmForMembershipChange(tx, ctx);
    assertCanGrantRole(actor, input.role);

    const existing = await tx.firmMembership.count({
      where: { status: { not: 'REMOVED' }, user: { email: input.email } },
    });
    if (existing) throw alreadyMember();

    await tx.firmInvitation.updateMany({
      where: { email: input.email, acceptedAt: null, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    const created = await tx.firmInvitation.create({
      data: {
        firmId: ctx.firmId,
        email: input.email,
        role: input.role,
        tokenHash: sha256Hex(rawToken),
        invitedByMembershipId: ctx.membershipId,
        expiresAt: new Date(Date.now() + INVITATION_TTL_SECONDS * 1000),
      },
      select: invitationView,
    });

    await recordAuditInTransaction(tx, {
      action: 'invitation.create',
      outcome: 'SUCCESS',
      firmId: ctx.firmId,
      actorUserId: ctx.userId,
      resourceType: 'invitation',
      resourceId: created.id,
      metadata: { role: input.role },
    });
    return created;
  });

  const firm = await prisma.firm.findUniqueOrThrow({
    where: { id: ctx.firmId },
    select: { name: true },
  });
  await getEmailSender()({
    to: invitation.email,
    template: 'firm-invitation',
    data: {
      token: rawToken,
      firmName: firm.name,
      inviterName: invitation.invitedBy.user.fullName,
      role: invitation.role,
    },
  });

  return invitation;
}

/** Pending, unexpired invitations — what an admin can still revoke. */
export async function listInvitations(ctx: TenantContext) {
  return forTenant(ctx).firmInvitation.findMany({
    where: { acceptedAt: null, revokedAt: null, expiresAt: { gt: new Date() } },
    select: invitationView,
    orderBy: { createdAt: 'desc' },
  });
}

export async function revokeInvitation(ctx: TenantContext, invitationId: string): Promise<void> {
  await forTenant(ctx).$transaction(async (tx) => {
    const actor = await lockFirmForMembershipChange(tx, ctx);
    const invitation = await tx.firmInvitation.findFirst({
      where: { id: invitationId, acceptedAt: null, revokedAt: null },
      select: { role: true },
    });
    if (!invitation) throw AppError.notFound('Invitation not found.');
    // Revoking an owner invitation is an owner decision, like granting one.
    assertCanGrantRole(actor, invitation.role);

    await tx.firmInvitation.updateMany({
      where: { id: invitationId },
      data: { revokedAt: new Date() },
    });
    await recordAuditInTransaction(tx, {
      action: 'invitation.revoke',
      outcome: 'SUCCESS',
      firmId: ctx.firmId,
      actorUserId: ctx.userId,
      resourceType: 'invitation',
      resourceId: invitationId,
    });
  });
}

/**
 * Accepts an invitation as the signed-in user. Runs without tenant context
 * (the caller isn't a member yet), so it uses the base client and filters
 * on the invitation's firm by hand. The user's email must match the
 * invited address; an ACTIVE user's email is verified (login requires it).
 * A previously removed member is reactivated with the invited role.
 */
export async function acceptInvitation(userId: string, rawToken: string) {
  return prisma.$transaction(async (tx) => {
    const found = await tx.firmInvitation.findUnique({
      where: { tokenHash: sha256Hex(rawToken) },
      select: { id: true, firmId: true },
    });
    if (!found) throw invalidInvitation();

    // Same lock as every other membership change in this firm.
    await tx.$queryRaw`SELECT 1 FROM "identity"."Firm" WHERE "id" = ${found.firmId} FOR UPDATE`;

    const invitation = await tx.firmInvitation.findFirst({
      where: {
        id: found.id,
        acceptedAt: null,
        revokedAt: null,
        expiresAt: { gt: new Date() },
        firm: { status: 'ACTIVE' },
      },
      select: {
        id: true,
        firmId: true,
        email: true,
        role: true,
        firm: { select: { id: true, name: true, slug: true } },
      },
    });
    if (!invitation) throw invalidInvitation();

    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { email: true, status: true, deletedAt: true },
    });
    if (!user || user.status !== 'ACTIVE' || user.deletedAt) throw AppError.forbidden();
    if (user.email !== invitation.email) {
      throw new AppError({
        status: 403,
        code: 'INVITATION_EMAIL_MISMATCH',
        detail: 'This invitation was sent to a different email address.',
      });
    }

    const firmId = invitation.firmId;
    const existing = await tx.firmMembership.findUnique({
      where: { firmId_userId: { firmId, userId } },
      select: { id: true, status: true },
    });
    if (existing && (existing.status === 'ACTIVE' || existing.status === 'SUSPENDED')) {
      throw alreadyMember();
    }

    const membership = existing
      ? await tx.firmMembership.update({
          where: { firmId_id: { firmId, id: existing.id } },
          data: { role: invitation.role, status: 'ACTIVE' },
          select: memberView,
        })
      : await tx.firmMembership.create({
          data: { firmId, userId, role: invitation.role, status: 'ACTIVE' },
          select: memberView,
        });

    await tx.firmInvitation.update({
      where: { id: invitation.id },
      data: { acceptedAt: new Date(), acceptedMembershipId: membership.id },
    });
    await recordAuditInTransaction(tx, {
      action: 'invitation.accept',
      outcome: 'SUCCESS',
      firmId,
      actorUserId: userId,
      resourceType: 'invitation',
      resourceId: invitation.id,
      metadata: { membershipId: membership.id, role: invitation.role, rejoined: !!existing },
    });

    return { firm: invitation.firm, membership };
  });
}
