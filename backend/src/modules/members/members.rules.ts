import type { FirmRole } from '@prisma/client';
import { AppError } from '../../shared/errors';

/**
 * Who may change whose membership (Stage 2). Pure, so the matrix is
 * unit-tested; the services call these after re-reading the actor under
 * the firm lock (see `lockFirmForMembershipChange`).
 *
 * - Only an OWNER can grant the OWNER role or touch an OWNER's membership.
 * - Nobody changes their own membership here: self-demotion or self-removal
 *   is how a firm loses its last owner by accident.
 * - Separately, every change must leave at least one ACTIVE OWNER.
 */
export interface Actor {
  membershipId: string;
  role: FirmRole;
}

export interface MemberTarget {
  id: string;
  role: FirmRole;
}

const ownerRequired = () =>
  new AppError({
    status: 403,
    code: 'OWNER_REQUIRED',
    detail: 'Only a firm owner can grant or change the owner role.',
  });

export function assertCanGrantRole(actor: Actor, role: FirmRole): void {
  if (role === 'OWNER' && actor.role !== 'OWNER') throw ownerRequired();
}

export function assertCanModifyMember(
  actor: Actor,
  target: MemberTarget,
  newRole?: FirmRole,
): void {
  if (target.id === actor.membershipId) {
    throw new AppError({
      status: 403,
      code: 'CANNOT_MODIFY_SELF',
      detail: 'You cannot change your own membership. Ask another owner or admin.',
    });
  }
  if (target.role === 'OWNER' && actor.role !== 'OWNER') throw ownerRequired();
  if (newRole) assertCanGrantRole(actor, newRole);
}
