import type { FirmRole } from '@prisma/client';

/**
 * Firm-level permissions (ADR-004). A static role → permission map in code:
 * the smallest boundary that lets routes check *capabilities* rather than
 * role names, so moving to configurable, DB-backed roles later changes this
 * file, not every route.
 *
 * Resource-level restrictions (e.g. a confidential matter visible only to
 * named people) are a separate, later layer — see `matterVisibility` in
 * matters.service.ts, the single choke point all matter reads go through.
 */
export const FIRM_PERMISSIONS = [
  'firm:manage',
  'member:read',
  'member:manage',
  'audit:read',
  'client:read',
  'client:write',
  'matter:read',
  'matter:write',
  'task:read',
  'task:write',
  'conversation:read',
  'conversation:write',
] as const;

export type FirmPermission = (typeof FIRM_PERMISSIONS)[number];

const WORKSPACE: FirmPermission[] = [
  'member:read',
  'client:read',
  'client:write',
  'matter:read',
  'matter:write',
  'task:read',
  'task:write',
  'conversation:read',
  'conversation:write',
];

const ROLE_PERMISSIONS: Record<FirmRole, ReadonlySet<FirmPermission>> = {
  OWNER: new Set(FIRM_PERMISSIONS),
  ADMIN: new Set<FirmPermission>([...WORKSPACE, 'member:manage', 'audit:read']),
  FEE_EARNER: new Set(WORKSPACE),
  // Support staff run the inbox and tasks, can look things up, but don't
  // open or change matters and client records.
  SUPPORT: new Set<FirmPermission>([
    'member:read',
    'client:read',
    'matter:read',
    'task:read',
    'task:write',
    'conversation:read',
    'conversation:write',
  ]),
};

export function roleHasPermission(role: FirmRole, permission: FirmPermission): boolean {
  return ROLE_PERMISSIONS[role].has(permission);
}
