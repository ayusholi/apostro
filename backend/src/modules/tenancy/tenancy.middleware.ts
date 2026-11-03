import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { AppError } from '../../shared/errors';
import { recordAudit } from '../audit/audit.writer';
import { roleHasPermission, type FirmPermission } from './permissions';
import { findActiveMembership } from './tenancy.repository';
import type { TenantContext } from './tenancy.types';

const firmIdSchema = z.string().uuid();

/**
 * Establishes tenant context for `/api/v1/firms/:firmId/...` (ADR-002).
 *
 * The `:firmId` in the URL is only a *selector*. Proof of access is an
 * ACTIVE membership row for the authenticated user — looked up here, on
 * every request, so a removed or suspended member loses access on their
 * next request rather than when a token expires.
 *
 * A firm the user can't access gets the same 404 as one that doesn't
 * exist, so the endpoint can't be used to discover which firm ids are real.
 * Must run after `authenticate()`.
 */
export function resolveTenant() {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const principal = req.principal;
    if (!principal) throw AppError.unauthenticated();

    const parsed = firmIdSchema.safeParse(req.params.firmId);
    if (!parsed.success) {
      throw AppError.validation({ 'params.firmId': ['Invalid firm id.'] });
    }

    const tenant = await findActiveMembership(principal.id, parsed.data);
    if (!tenant) {
      await recordAudit({
        action: 'tenant.access',
        outcome: 'DENIED',
        actorUserId: principal.id,
        resourceType: 'firm',
        resourceId: parsed.data,
        ipAddress: req.ip,
      });
      throw AppError.notFound('Firm not found.');
    }

    req.tenant = tenant;
    next();
  };
}

/** Reads the verified context. Throws if a route forgot `resolveTenant()` — fail closed. */
export function getTenant(req: Request): TenantContext {
  if (!req.tenant) {
    throw new Error('Tenant context missing: resolveTenant() must run before this handler.');
  }
  return req.tenant;
}

/** Firm-level capability check (ADR-004). Denials are audited. */
export function requireFirmPermission(permission: FirmPermission) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const tenant = getTenant(req);
    if (!roleHasPermission(tenant.role, permission)) {
      await recordAudit({
        action: 'permission.check',
        outcome: 'DENIED',
        firmId: tenant.firmId,
        actorUserId: tenant.userId,
        ipAddress: req.ip,
        metadata: { permission, role: tenant.role },
      });
      throw AppError.forbidden();
    }
    next();
  };
}
