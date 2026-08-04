import { redis } from '../db/redis';
import { logger } from './logger';

const CACHE_TTL_SECONDS = 300; // L2 cache — RBAC-DESIGN.md §6. A safety-net TTL,
// not the correctness mechanism: real invalidation is event-driven, wired
// in by the identity module via `invalidatePermissions`.

export type PermissionResolver = (userId: string) => Promise<string[]>;

/**
 * The DB-backed resolution step (RBAC-DESIGN.md §5–§7) doesn't exist yet —
 * there's no identity/RBAC Prisma schema. Denying by default here, rather
 * than allowing everything, is deliberate: RBAC-DESIGN.md §12 and
 * AUTH-DESIGN.md §7 both require a forgotten/missing wiring to fail closed.
 * The identity module replaces this via `setPermissionResolver` once real
 * roles exist (INFRASTRUCTURE-DESIGN.md §2 composition-root pattern — this
 * is the one swap point in an otherwise-complete piece of infrastructure).
 */
let resolvePermissions: PermissionResolver = (userId) => {
  logger.warn(
    { userId },
    'No permission resolver configured — denying by default (RBAC-DESIGN.md §12)',
  );
  return Promise.resolve([]);
};

export function setPermissionResolver(resolver: PermissionResolver): void {
  resolvePermissions = resolver;
}

function cacheKey(userId: string): string {
  return `perm:${userId}`;
}

/**
 * Cache-aside read of a user's effective permission set (RBAC-DESIGN.md
 * §6's L2 tier). A cold cache re-resolves from `resolvePermissions` — it
 * can never grant or leak a permission, only make the correct one slower
 * to fetch.
 */
export async function getEffectivePermissions(userId: string): Promise<string[]> {
  const cached = await redis.get(cacheKey(userId));
  if (cached) {
    return JSON.parse(cached) as string[];
  }

  const permissions = await resolvePermissions(userId);
  await redis.set(cacheKey(userId), JSON.stringify(permissions), 'EX', CACHE_TTL_SECONDS);
  return permissions;
}

/**
 * Busts the cache for one user — called by the identity module on role/
 * assignment changes, and by session revocation as a belt-and-braces
 * measure (AUTH-DESIGN.md §6.6, RBAC-DESIGN.md §6).
 */
export async function invalidatePermissions(userId: string): Promise<void> {
  await redis.del(cacheKey(userId));
}

/**
 * Permission-key matching (RBAC-DESIGN.md §3.1, §5): exact match, the
 * Super Admin `*:*` short-circuit, or a resource-level wildcard
 * (`booking:*` satisfies a required `booking:cancel`).
 */
export function hasPermission(granted: string[], required: string): boolean {
  if (granted.includes('*:*') || granted.includes(required)) {
    return true;
  }
  const resource = required.split(':')[0];
  return granted.includes(`${resource}:*`);
}
