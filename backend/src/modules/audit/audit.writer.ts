import type { AuditOutcome, Prisma } from '@prisma/client';
import { prisma } from '../../db/prisma';
import { logger } from '../../shared/logger';
import { getRequestId } from '../../shared/requestContext';

/**
 * Writes to the append-only audit trail (audit.AuditEvent — the trigger in
 * the tenancy migration rejects UPDATE/DELETE). Distinct from the matter
 * activity timeline: this answers "who did what, and was it allowed",
 * for accountability, not for day-to-day work.
 *
 * `metadata` is for identifiers and small facts only. Never put message
 * bodies, credentials, tokens or unnecessary personal data in it.
 */
export interface AuditEntry {
  action: string;
  outcome: AuditOutcome;
  firmId?: string | null;
  actorUserId?: string | null;
  resourceType?: string;
  resourceId?: string;
  ipAddress?: string;
  metadata?: Prisma.InputJsonValue;
}

/**
 * Just the one method used, so both a base-client transaction and a
 * tenant-scoped one (`forTenant(ctx).$transaction`, which stamps firmId)
 * can be passed.
 */
interface AuditClient {
  auditEvent: { create(args: { data: Prisma.AuditEventCreateInput }): PromiseLike<unknown> };
}

function toData(entry: AuditEntry): Prisma.AuditEventCreateInput {
  return { ...entry, requestId: getRequestId() };
}

/**
 * Records an event as part of a caller's transaction — use this for
 * changes whose audit record must exist if and only if the change commits
 * (membership and permission changes, for example).
 */
export async function recordAuditInTransaction(tx: AuditClient, entry: AuditEntry): Promise<void> {
  await tx.auditEvent.create({ data: toData(entry) });
}

/**
 * Best-effort record for events that aren't tied to a write — denied
 * access attempts, for instance. A failure is logged loudly but doesn't
 * change the response the caller was already going to give.
 */
export async function recordAudit(entry: AuditEntry): Promise<void> {
  try {
    await prisma.auditEvent.create({ data: toData(entry) });
  } catch (err) {
    logger.error({ err, action: entry.action }, 'Failed to write audit event');
  }
}
