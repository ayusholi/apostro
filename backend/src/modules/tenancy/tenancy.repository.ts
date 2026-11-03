import { prisma } from '../../db/prisma';
import type { TenantContext } from './tenancy.types';

/**
 * The one query that turns "this user claims firm X" into a verified
 * tenant context. A membership only counts when the membership, the firm
 * and the user are all ACTIVE (and the user isn't soft-deleted). Uses the
 * base client deliberately: tenant context doesn't exist yet at this point.
 */
export async function findActiveMembership(
  userId: string,
  firmId: string,
): Promise<TenantContext | null> {
  const membership = await prisma.firmMembership.findFirst({
    where: {
      firmId,
      userId,
      status: 'ACTIVE',
      firm: { status: 'ACTIVE' },
      user: { status: 'ACTIVE', deletedAt: null },
    },
    select: { id: true, firmId: true, userId: true, role: true },
  });

  if (!membership) return null;
  return {
    firmId: membership.firmId,
    membershipId: membership.id,
    userId: membership.userId,
    role: membership.role,
  };
}

/** The firms a user can switch into — drives firm selection after login. */
export async function listActiveMemberships(userId: string) {
  return prisma.firmMembership.findMany({
    where: { userId, status: 'ACTIVE', firm: { status: 'ACTIVE' } },
    select: {
      id: true,
      role: true,
      firm: { select: { id: true, name: true, slug: true } },
    },
    orderBy: { firm: { name: 'asc' } },
  });
}
