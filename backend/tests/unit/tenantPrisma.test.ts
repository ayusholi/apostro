import { describe, expect, it } from 'vitest';
import { scopeArgs, TenantScopeError, TENANT_MODELS } from '../../src/modules/tenancy/tenantPrisma';

const FIRM_A = '11111111-1111-4111-8111-111111111111';
const FIRM_B = '22222222-2222-4222-8222-222222222222';

describe('scopeArgs — tenant scoping of Prisma operations', () => {
  it.each([
    'findMany',
    'findFirst',
    'findFirstOrThrow',
    'count',
    'aggregate',
    'groupBy',
    'updateMany',
    'deleteMany',
  ])('%s: adds the tenant firmId to the filter', (operation) => {
    expect(scopeArgs('Client', operation, { where: { status: 'ACTIVE' } }, FIRM_A)).toEqual({
      where: { AND: [{ status: 'ACTIVE' }, { firmId: FIRM_A }] },
    });
  });

  it('scopes a query with no filter at all', () => {
    expect(scopeArgs('Matter', 'findMany', undefined, FIRM_A)).toEqual({
      where: { firmId: FIRM_A },
    });
  });

  it("can't be widened by a caller filtering on another firm", () => {
    // The caller's own firmId condition is ANDed with the tenant's, so a
    // request for Firm B's rows from Firm A's context matches nothing.
    const scoped = scopeArgs('Client', 'findMany', { where: { firmId: FIRM_B } }, FIRM_A);
    expect(scoped).toEqual({ where: { AND: [{ firmId: FIRM_B }, { firmId: FIRM_A }] } });
  });

  it("can't be widened by an OR at the top level", () => {
    const scoped = scopeArgs(
      'Task',
      'findMany',
      { where: { OR: [{ firmId: FIRM_B }, { id: 'x' }] } },
      FIRM_A,
    ) as {
      where: { AND: unknown[] };
    };
    expect(scoped.where.AND).toContainEqual({ firmId: FIRM_A });
  });

  it('create: stamps the tenant firmId', () => {
    expect(scopeArgs('Task', 'create', { data: { title: 'Call client' } }, FIRM_A)).toEqual({
      data: { title: 'Call client', firmId: FIRM_A },
    });
  });

  it('create: refuses data for another firm', () => {
    expect(() =>
      scopeArgs('Task', 'create', { data: { title: 'x', firmId: FIRM_B } }, FIRM_A),
    ).toThrow(TenantScopeError);
  });

  it("create: refuses a nested 'firm' relation write", () => {
    expect(() =>
      scopeArgs(
        'Task',
        'create',
        { data: { title: 'x', firm: { connect: { id: FIRM_B } } } },
        FIRM_A,
      ),
    ).toThrow(TenantScopeError);
  });

  it('createMany: checks and stamps every row', () => {
    expect(
      scopeArgs(
        'Client',
        'createMany',
        { data: [{ displayName: 'a' }, { displayName: 'b' }] },
        FIRM_A,
      ),
    ).toEqual({
      data: [
        { displayName: 'a', firmId: FIRM_A },
        { displayName: 'b', firmId: FIRM_A },
      ],
    });
    expect(() =>
      scopeArgs(
        'Client',
        'createMany',
        { data: [{ displayName: 'a' }, { displayName: 'b', firmId: FIRM_B }] },
        FIRM_A,
      ),
    ).toThrow(TenantScopeError);
  });

  it.each(['findUnique', 'findUniqueOrThrow', 'update', 'delete', 'upsert'])(
    '%s by bare id is refused (it would bypass the firm filter)',
    (operation) => {
      expect(() => scopeArgs('Matter', operation, { where: { id: 'm1' } }, FIRM_A)).toThrow(
        TenantScopeError,
      );
    },
  );

  it('unique operations are allowed through a firmId compound key for this tenant only', () => {
    const args = { where: { firmId_id: { firmId: FIRM_A, id: 'm1' } }, data: { title: 't' } };
    expect(scopeArgs('Matter', 'update', args, FIRM_A)).toEqual(args);
    expect(() =>
      scopeArgs('Matter', 'update', { where: { firmId_id: { firmId: FIRM_B, id: 'm1' } } }, FIRM_A),
    ).toThrow(TenantScopeError);
  });

  it('upsert through a compound key still stamps the create branch', () => {
    const scoped = scopeArgs(
      'Client',
      'upsert',
      {
        where: { firmId_id: { firmId: FIRM_A, id: 'c1' } },
        create: { displayName: 'n' },
        update: {},
      },
      FIRM_A,
    ) as { create: Record<string, unknown> };
    expect(scoped.create.firmId).toBe(FIRM_A);
  });

  it('refuses non-tenant models, so platform tables are only read deliberately', () => {
    for (const model of ['User', 'Session', 'Firm', 'AuditEvent']) {
      expect(TENANT_MODELS.has(model)).toBe(false);
      expect(() => scopeArgs(model, 'findMany', {}, FIRM_A)).toThrow(TenantScopeError);
    }
  });

  it('refuses unknown operations rather than passing them through', () => {
    expect(() => scopeArgs('Client', 'somethingNew', {}, FIRM_A)).toThrow(TenantScopeError);
  });
});
