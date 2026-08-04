import type { NextFunction, Request, Response } from 'express';
import { redis } from '../db/redis';
import { AppError } from '../shared/errors';
import { verifyAccessToken } from '../shared/jwt';
import type { PrincipalType } from '../shared/principal';

const BEARER_PREFIX = 'Bearer ';

export interface AuthenticateOptions {
  /** Restrict to one principal type — e.g. `{ allow: ['staff'] }` on admin-only routes (AUTH-DESIGN.md §7.4). Defaults to allowing either. */
  allow?: PrincipalType[];
}

function extractBearerToken(req: Request): string {
  const header = req.header('authorization');
  if (!header?.startsWith(BEARER_PREFIX)) {
    throw AppError.unauthenticated('Missing or malformed Authorization header.');
  }
  return header.slice(BEARER_PREFIX.length);
}

/**
 * Verifies the access token and confirms the session hasn't been revoked
 * (AUTH-DESIGN.md §7.1). The Redis `session:{sid}` key IS the revocation
 * allowlist, not a denylist — deleting it (logout, forced logout, password
 * reset) revokes access immediately, without waiting out the JWT's TTL.
 *
 * Not mounted globally: with no feature routes yet, there's nothing for a
 * blanket guard to protect. Mount per-router once a module needs it:
 *   router.use(authenticate({ allow: ['staff'] }))
 */
export function authenticate(options: AuthenticateOptions = {}) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const token = extractBearerToken(req);
    const principal = verifyAccessToken(token);

    if (options.allow && !options.allow.includes(principal.typ)) {
      throw AppError.unauthenticated('This token is not valid for this surface.');
    }

    const sessionExists = await redis.exists(`session:${principal.sid}`);
    if (!sessionExists) {
      throw AppError.unauthenticated('Session has been revoked or has expired.');
    }

    req.principal = principal;
    next();
  };
}
