import type { FirmRole } from '@prisma/client';

/**
 * The verified tenant context for one request or job (ADR-002). Only ever
 * built by `resolveTenantContext` from a database membership lookup — never
 * from a client-supplied value. Services take it as their first argument
 * explicitly, rather than reading ambient state, so every tenant-owned
 * operation visibly depends on it.
 */
export interface TenantContext {
  readonly firmId: string;
  readonly membershipId: string;
  readonly userId: string;
  readonly role: FirmRole;
}
