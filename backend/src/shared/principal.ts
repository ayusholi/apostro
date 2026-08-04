/**
 * The two authenticated principals (AUTH-DESIGN.md §1) — kept structurally
 * distinct on purpose: conflating staff and client auth is how portals leak.
 */
export type PrincipalType = 'staff' | 'client';

/**
 * What `authenticate` middleware attaches to `req.principal` (AUTH-DESIGN.md
 * §7.1). Deliberately minimal — identity only, no roles/permissions, so a
 * permission change takes effect on the next request rather than waiting
 * for a token to expire (RBAC-DESIGN.md §5).
 */
export interface Principal {
  /** The user or client id (JWT `sub`). */
  id: string;
  /** Session id — keys the Redis revocation allowlist (`session:{sid}`). */
  sid: string;
  typ: PrincipalType;
}
