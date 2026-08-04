import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../shared/errors';
import { logger } from '../shared/logger';
import { getEffectivePermissions, hasPermission } from '../shared/permissions';

function requirePrincipal(req: Request): NonNullable<Request['principal']> {
  if (!req.principal) {
    // Programmer error, not a client error: authorize() was mounted
    // without authenticate() running first. Surface it the same way an
    // unauthenticated *request* would, since that's the practical effect.
    throw AppError.unauthenticated();
  }
  return req.principal;
}

function denyIfMissing(matched: boolean, req: Request, required: string[]): void {
  if (matched) return;
  logger.warn(
    { userId: req.principal?.id, required, traceId: req.id },
    'Permission denied', // RBAC-DESIGN.md §10 — the durable authz.permission.denied audit
    // event is written once the audit module/table exists; this is the
    // interim structured signal.
  );
  throw AppError.forbidden();
}

/** Requires ALL listed permissions — AND semantics (RBAC-DESIGN.md §8.2 PermissionsGuard). */
export function authorize(...required: string[]) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const principal = requirePrincipal(req);
    const granted = await getEffectivePermissions(principal.id);
    denyIfMissing(
      required.every((permission) => hasPermission(granted, permission)),
      req,
      required,
    );
    next();
  };
}

/** Requires ANY listed permission — OR semantics (RBAC-DESIGN.md §8.1 RequireAnyPermission). */
export function authorizeAny(...required: string[]) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const principal = requirePrincipal(req);
    const granted = await getEffectivePermissions(principal.id);
    denyIfMissing(
      required.some((permission) => hasPermission(granted, permission)),
      req,
      required,
    );
    next();
  };
}
