import { AppError } from '../../shared/errors';
import type { ListAuditLogQuery } from './audit.schema';

/**
 * Read-only compliance surface over the append-only audit log
 * (API-DESIGN.md §16). No create/update/delete by design — see
 * audit.repository.ts. Not implemented yet.
 */

export async function listAuditLog(_query: ListAuditLogQuery): Promise<never> {
  throw AppError.notImplemented('Listing the audit log is not implemented yet.');
}

export async function getAuditLogEntry(_id: string): Promise<never> {
  throw AppError.notImplemented('Fetching an audit log entry is not implemented yet.');
}
