import { createHash, randomBytes } from 'node:crypto';

/**
 * Deterministic SHA-256 hex digest — used to hash opaque bearer tokens
 * (refresh tokens, verification tokens, and future capability tokens like
 * a booking's manage token) before they're stored, so a DB dump yields
 * hashes, not usable credentials. SHA-256, not a slow KDF (bcrypt/argon2):
 * these tokens are already high-entropy CSPRNG output, not human
 * passwords, and the lookup path needs to find a row *by* the hash —
 * a deliberately slow hash would make every request pay that cost
 * (AUTH-DESIGN.md §2.2, §4.1).
 */
export function sha256Hex(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

/**
 * A cryptographically random, URL-safe opaque token — the raw value handed
 * to a client (in a cookie, an email link, …). Only `sha256Hex` of this is
 * ever persisted.
 */
export function generateOpaqueToken(bytes = 32): string {
  return randomBytes(bytes).toString('base64url');
}
