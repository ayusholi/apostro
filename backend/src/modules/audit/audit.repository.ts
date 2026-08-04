/**
 * Append-only reads over `audit.AuditLog` (FOLDER-STRUCTURE.md §4) —
 * partition-aware once the table is range-partitioned by `occurredAt`
 * (DATABASE-DESIGN.md §5, §7). No write path here by design: the app DB
 * role holds no UPDATE/DELETE grant on this schema, and every write comes
 * from other modules' domain events, not this one.
 *
 * Not implemented yet — `audit.AuditLog` has no Prisma model/migration.
 */

import { AppError } from '../../shared/errors';
import type { ListAuditLogQuery } from './audit.schema';

export async function listAuditLog(_query: ListAuditLogQuery): Promise<never> {
  throw AppError.notImplemented('Listing the audit log is not implemented yet.');
}

export async function findAuditLogEntryById(_id: string): Promise<never> {
  throw AppError.notImplemented('Fetching an audit log entry is not implemented yet.');
}
