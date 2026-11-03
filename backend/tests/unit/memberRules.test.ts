import { describe, expect, it } from 'vitest';
import type { FirmRole } from '@prisma/client';
import { slugify } from '../../src/modules/firms/firms.service';
import { assertCanGrantRole, assertCanModifyMember } from '../../src/modules/members/members.rules';
import { AppError } from '../../src/shared/errors';

const ROLES: FirmRole[] = ['OWNER', 'ADMIN', 'FEE_EARNER', 'SUPPORT'];

function code(fn: () => void): string | null {
  try {
    fn();
    return null;
  } catch (err) {
    if (err instanceof AppError) return err.code;
    throw err;
  }
}

describe('assertCanGrantRole', () => {
  it.each(ROLES)('an OWNER can grant %s', (role) => {
    expect(code(() => assertCanGrantRole({ membershipId: 'a', role: 'OWNER' }, role))).toBeNull();
  });

  it.each(ROLES)('an ADMIN can grant %s only if it is not OWNER', (role) => {
    expect(code(() => assertCanGrantRole({ membershipId: 'a', role: 'ADMIN' }, role))).toBe(
      role === 'OWNER' ? 'OWNER_REQUIRED' : null,
    );
  });
});

describe('assertCanModifyMember', () => {
  const owner = { membershipId: 'owner', role: 'OWNER' as const };
  const admin = { membershipId: 'admin', role: 'ADMIN' as const };

  it('nobody can modify their own membership, owners included', () => {
    expect(code(() => assertCanModifyMember(owner, { id: 'owner', role: 'OWNER' }))).toBe(
      'CANNOT_MODIFY_SELF',
    );
    expect(code(() => assertCanModifyMember(admin, { id: 'admin', role: 'ADMIN' }, 'OWNER'))).toBe(
      'CANNOT_MODIFY_SELF',
    );
  });

  it('only an owner can touch an owner’s membership', () => {
    expect(code(() => assertCanModifyMember(admin, { id: 'o2', role: 'OWNER' }))).toBe(
      'OWNER_REQUIRED',
    );
    expect(code(() => assertCanModifyMember(owner, { id: 'o2', role: 'OWNER' }, 'ADMIN'))).toBe(
      null,
    );
  });

  it('an admin manages non-owners but cannot promote them to owner', () => {
    expect(code(() => assertCanModifyMember(admin, { id: 'f', role: 'FEE_EARNER' }, 'ADMIN'))).toBe(
      null,
    );
    expect(code(() => assertCanModifyMember(admin, { id: 'f', role: 'FEE_EARNER' }, 'OWNER'))).toBe(
      'OWNER_REQUIRED',
    );
  });
});

describe('slugify', () => {
  it.each([
    ['Harlow & Reyes LLP', 'harlow-reyes-llp'],
    ['  Café Légal  ', 'cafe-legal'],
    ['O’Brien -- Partners', 'o-brien-partners'],
    ['!!!', ''],
  ])('%s → %s', (name, slug) => {
    expect(slugify(name)).toBe(slug);
  });

  it('caps length without leaving a trailing hyphen', () => {
    const slug = slugify(`${'a'.repeat(59)} b`);
    expect(slug.length).toBeLessThanOrEqual(60);
    expect(slug.endsWith('-')).toBe(false);
  });
});
