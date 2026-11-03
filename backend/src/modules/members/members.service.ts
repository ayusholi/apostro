import type { MembershipStatus, Prisma } from '@prisma/client';
import { AppError } from '../../shared/errors';
import { recordAuditInTransaction, type AuditEntry } from '../audit/audit.writer';
import { roleHasPermission } from '../tenancy/permissions';
import { forTenant, type TenantPrisma } from '../tenancy/tenantPrisma';
import type { TenantContext } from '../tenancy/tenancy.types';
import { assertCanModifyMember, type Actor } from './members.rules';
import type { ListMembersQuery, UpdateMemberInput } from './members.schema';

export const memberView = {
  id: true,
  role: true,
  status: true,
  createdAt: true,
  user: { select: { id: true, fullName: true, email: true } },
} as const;

type LockDb = Pick<TenantPrisma, 'firmMembership' | '$queryRaw'>;

/**
 * Serialises every membership change in one firm (role changes, removals,
 * invitations, acceptance) by locking the Firm row, then re-reads the
 * acting member under that lock. The tenant context was verified at the
 * start of the request; this closes the gap where two owners remove each
 * other at the same moment and the firm is left with none.
 *
 * Raw SQL isn't scoped by `forTenant`; this one filters on the context's
 * firm id by hand.
 */
export async function lockFirmForMembershipChange(db: LockDb, ctx: TenantContext): Promise<Actor> {
  await db.$queryRaw`SELECT 1 FROM "identity"."Firm" WHERE "id" = ${ctx.firmId} FOR UPDATE`;
  const actor = await db.firmMembership.findFirst({
    where: { id: ctx.membershipId, status: 'ACTIVE' },
    select: { id: true, role: true },
  });
  if (!actor || !roleHasPermission(actor.role, 'member:manage')) throw AppError.forbidden();
  return { membershipId: actor.id, role: actor.role };
}

async function assertFirmKeepsAnOwner(db: Pick<TenantPrisma, 'firmMembership'>): Promise<void> {
  const owners = await db.firmMembership.count({ where: { role: 'OWNER', status: 'ACTIVE' } });
  if (owners === 0) {
    throw new AppError({
      status: 409,
      code: 'LAST_OWNER',
      detail: 'A firm must keep at least one active owner.',
    });
  }
}

export async function listMembers(ctx: TenantContext, query: ListMembersQuery) {
  const status: Prisma.EnumMembershipStatusFilter = query.status
    ? { equals: query.status }
    : { not: 'REMOVED' };
  return forTenant(ctx).firmMembership.findMany({
    where: { status },
    select: memberView,
    orderBy: { user: { fullName: 'asc' } },
  });
}

function memberAudit(ctx: TenantContext, membershipId: string, entry: Partial<AuditEntry>) {
  return {
    action: 'member.update',
    outcome: 'SUCCESS' as const,
    firmId: ctx.firmId,
    actorUserId: ctx.userId,
    resourceType: 'membership',
    resourceId: membershipId,
    ...entry,
  };
}

async function loadTarget(db: Pick<TenantPrisma, 'firmMembership'>, membershipId: string) {
  const target = await db.firmMembership.findFirst({
    where: { id: membershipId, status: { not: 'REMOVED' } },
    select: { id: true, role: true, status: true },
  });
  if (!target) throw AppError.notFound('Member not found.');
  return target;
}

export async function updateMember(
  ctx: TenantContext,
  membershipId: string,
  input: UpdateMemberInput,
) {
  return forTenant(ctx).$transaction(async (tx) => {
    const actor = await lockFirmForMembershipChange(tx, ctx);
    const target = await loadTarget(tx, membershipId);
    assertCanModifyMember(actor, target, input.role);

    const data: { role?: typeof target.role; status?: MembershipStatus } = {};
    if (input.role && input.role !== target.role) data.role = input.role;
    if (input.status && input.status !== target.status) data.status = input.status;

    if (Object.keys(data).length) {
      await tx.firmMembership.updateMany({ where: { id: membershipId }, data });
      await assertFirmKeepsAnOwner(tx);

      if (data.role) {
        await recordAuditInTransaction(
          tx,
          memberAudit(ctx, membershipId, {
            action: 'member.role_change',
            metadata: { from: target.role, to: data.role },
          }),
        );
      }
      if (data.status) {
        await recordAuditInTransaction(
          tx,
          memberAudit(ctx, membershipId, {
            action: data.status === 'SUSPENDED' ? 'member.suspend' : 'member.reactivate',
            metadata: { from: target.status, to: data.status },
          }),
        );
      }
    }

    return tx.firmMembership.findFirstOrThrow({ where: { id: membershipId }, select: memberView });
  });
}

/**
 * Soft removal: the row stays, because tasks, matters and the activity
 * timeline still reference the person. Access ends on their next request
 * (resolveTenant checks membership every time). Re-adding is by invitation.
 */
export async function removeMember(ctx: TenantContext, membershipId: string): Promise<void> {
  await forTenant(ctx).$transaction(async (tx) => {
    const actor = await lockFirmForMembershipChange(tx, ctx);
    const target = await loadTarget(tx, membershipId);
    assertCanModifyMember(actor, target);

    await tx.firmMembership.updateMany({
      where: { id: membershipId },
      data: { status: 'REMOVED' },
    });
    await assertFirmKeepsAnOwner(tx);
    await recordAuditInTransaction(
      tx,
      memberAudit(ctx, membershipId, {
        action: 'member.remove',
        metadata: { role: target.role, from: target.status },
      }),
    );
  });
}
