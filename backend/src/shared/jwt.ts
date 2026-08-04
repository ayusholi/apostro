import { randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AppError } from './errors';
import type { Principal, PrincipalType } from './principal';

const ALGORITHM = 'RS256';

export interface AccessTokenClaims {
  sub: string;
  typ: PrincipalType;
  sid: string;
}

/**
 * Issues an access token (AUTH-DESIGN.md §2.1). RS256 so a verifier only
 * ever needs the public key — key separation you want and can't retrofit
 * cheaply once something else needs to verify tokens without holding the
 * signing key. Claims are identity-only: no roles/permissions, so a
 * permission change takes effect on the next request instead of waiting
 * for the token to expire (RBAC-DESIGN.md §5).
 */
export function signAccessToken(claims: AccessTokenClaims): string {
  return jwt.sign({ ...claims, jti: randomUUID() }, config.jwt.privateKey, {
    algorithm: ALGORITHM,
    expiresIn: config.jwt.accessTokenTtlSeconds,
  });
}

/**
 * Verifies signature and expiry only. Session liveness (has this session
 * been revoked?) is a separate, deliberate check against Redis — see
 * middleware/authenticate.ts — because a JWT alone can never be revoked
 * before it expires.
 */
export function verifyAccessToken(token: string): Principal {
  let decoded: string | jwt.JwtPayload;

  try {
    decoded = jwt.verify(token, config.jwt.publicKey, { algorithms: [ALGORITHM] });
  } catch {
    throw AppError.unauthenticated('Invalid or expired access token.');
  }

  if (
    typeof decoded === 'string' ||
    typeof decoded.sub !== 'string' ||
    typeof decoded.sid !== 'string' ||
    (decoded.typ !== 'staff' && decoded.typ !== 'client')
  ) {
    throw AppError.unauthenticated('Access token payload is malformed.');
  }

  // `typ` is asserted, not just narrowed: jsonwebtoken types custom claims
  // as `any` via JwtPayload's index signature, and — unlike the `typeof`
  // checks above, which TS does narrow `any` through — the equality check
  // against 'staff'/'client' above doesn't. The runtime check still holds.
  return { id: decoded.sub, sid: decoded.sid, typ: decoded.typ as PrincipalType };
}
