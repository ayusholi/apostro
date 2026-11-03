import { describe, expect, it } from 'vitest';
import type { FirmRole } from '@prisma/client';
import {
  FIRM_PERMISSIONS,
  roleHasPermission,
  type FirmPermission,
} from '../../src/modules/tenancy/permissions';

/** The intended matrix, written out so a change to permissions.ts is a deliberate, reviewed diff here too. */
const EXPECTED: Record<FirmRole, FirmPermission[]> = {
  OWNER: [...FIRM_PERMISSIONS],
  ADMIN: FIRM_PERMISSIONS.filter((p) => p !== 'firm:manage'),
  FEE_EARNER: [
    'member:read',
    'client:read',
    'client:write',
    'matter:read',
    'matter:write',
    'task:read',
    'task:write',
    'conversation:read',
    'conversation:write',
  ],
  SUPPORT: [
    'member:read',
    'client:read',
    'matter:read',
    'task:read',
    'task:write',
    'conversation:read',
    'conversation:write',
  ],
};

describe('firm role permissions', () => {
  for (const [role, granted] of Object.entries(EXPECTED) as [FirmRole, FirmPermission[]][]) {
    it.each(FIRM_PERMISSIONS)(`${role} — %s`, (permission) => {
      expect(roleHasPermission(role, permission)).toBe(granted.includes(permission));
    });
  }
});
