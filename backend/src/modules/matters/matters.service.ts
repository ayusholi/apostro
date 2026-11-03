import type { Prisma, TaskStatus } from '@prisma/client';
import { AppError } from '../../shared/errors';
import { forTenant } from '../tenancy/tenantPrisma';
import type { TenantContext } from '../tenancy/tenancy.types';

/**
 * Resource-level visibility for matters — the single choke point every
 * matter read goes through (ADR-004). Today every member with
 * `matter:read` sees every matter in their firm. When confidential or
 * ring-fenced matters arrive, the restriction is added *here* (e.g.
 * `{ OR: [{ restricted: false }, { access: { some: { membershipId } } }] }`)
 * and every caller inherits it.
 */
export function matterVisibility(_ctx: TenantContext): Prisma.MatterWhereInput {
  return {};
}

const memberSummary = {
  id: true,
  role: true,
  user: { select: { fullName: true } },
} satisfies Prisma.FirmMembershipSelect;

/** Throws 404 unless the matter exists in this firm and is visible to the caller. */
async function requireVisibleMatter(ctx: TenantContext, matterId: string): Promise<void> {
  const found = await forTenant(ctx).matter.count({
    where: { AND: [matterVisibility(ctx), { id: matterId }] },
  });
  if (!found) throw AppError.notFound('Matter not found.');
}

export async function getMatter(ctx: TenantContext, matterId: string) {
  const matter = await forTenant(ctx).matter.findFirst({
    where: { AND: [matterVisibility(ctx), { id: matterId }] },
    select: {
      id: true,
      reference: true,
      title: true,
      matterType: true,
      status: true,
      stage: true,
      openedAt: true,
      closedAt: true,
      updatedAt: true,
      responsible: { select: memberSummary },
      clients: {
        select: { role: true, client: { select: { id: true, displayName: true, kind: true } } },
      },
      _count: { select: { tasks: { where: { status: 'OPEN' } } } },
    },
  });
  if (!matter) throw AppError.notFound('Matter not found.');

  const { _count, ...rest } = matter;
  return { ...rest, openTaskCount: _count.tasks };
}

/** "What's outstanding on this matter" — soonest due first, undated last. */
export async function listMatterTasks(ctx: TenantContext, matterId: string, status: TaskStatus) {
  await requireVisibleMatter(ctx, matterId);
  return forTenant(ctx).task.findMany({
    where: { matterId, status },
    select: {
      id: true,
      title: true,
      status: true,
      dueAt: true,
      completedAt: true,
      assignee: { select: memberSummary },
    },
    orderBy: [{ dueAt: { sort: 'asc', nulls: 'last' } }, { createdAt: 'asc' }],
  });
}

/** Matters linked to a client, filtered by matter visibility. */
export async function listMattersForClient(ctx: TenantContext, clientId: string) {
  return forTenant(ctx).matter.findMany({
    where: { AND: [matterVisibility(ctx), { clients: { some: { clientId } } }] },
    select: { id: true, reference: true, title: true, status: true, stage: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' },
  });
}

/** Recent timeline entries for a matter or a client, newest first. */
export async function listActivity(
  ctx: TenantContext,
  subject: { matterId: string } | { clientId: string },
  limit: number,
) {
  if ('matterId' in subject) await requireVisibleMatter(ctx, subject.matterId);
  return forTenant(ctx).activityEvent.findMany({
    where:
      'matterId' in subject
        ? { matterId: subject.matterId }
        : // A client's timeline must not leak entries from matters the caller can't see.
          {
            clientId: subject.clientId,
            OR: [{ matterId: null }, { matter: matterVisibility(ctx) }],
          },
    select: {
      id: true,
      type: true,
      summary: true,
      matterId: true,
      subjectId: true,
      occurredAt: true,
      actor: { select: memberSummary },
    },
    orderBy: { occurredAt: 'desc' },
    take: limit,
  });
}
