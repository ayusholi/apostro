import argon2 from 'argon2';

/**
 * Argon2id (AUTH-DESIGN.md §4.2) — the current OWASP/RFC 9106 recommendation
 * for password storage: memory-hard, so it resists GPU/ASIC cracking far
 * better than bcrypt at equivalent settings. `argon2id` specifically (not
 * `argon2i`/`argon2d`) is the hybrid variant, resistant to both side-channel
 * and GPU cracking attacks — the correct choice when you don't have a
 * reason to pick one of the pure variants.
 */
export function hashPassword(plain: string): Promise<string> {
  return argon2.hash(plain, { type: argon2.argon2id });
}

export function verifyPassword(hash: string, plain: string): Promise<boolean> {
  return argon2.verify(hash, plain);
}
