import { randomUUID } from 'node:crypto';
import express from 'express';
import request from 'supertest';
import { Prisma } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../../src/app';
import { signAccessToken } from '../../src/shared/jwt';
import { requestId } from '../../src/middleware/requestId';
import { errorHandler } from '../../src/middleware/errorHandler';
import { requireFirmPermission } from '../../src/modules/tenancy/tenancy.middleware';

// vi.mock() calls below are hoisted above these imports by Vitest, so the
// app is built against the doubles.

/**
 * The real app, middleware chain and JWT verification, with the database
 * and Redis replaced by doubles. Proves the request pipeline's security
 * behaviour without infrastructure; the same boundaries are re-tested
 * against real Postgres + Redis in tests/integration.
 */
const mocks = vi.hoisted(() => ({
  sessionExists: vi.fn<(key: string) => Promise<number>>(),
  dbHealthy: vi.fn<() => Promise<boolean>>(),
  redisHealthy: vi.fn<() => Promise<boolean>>(),
  findActiveMembership: vi.fn(),
  recordAudit: vi.fn(),
  findFirm: vi.fn(),
}));

vi.mock('../../src/db/redis', () => ({
  redis: { exists: mocks.sessionExists },
  checkRedisConnection: mocks.redisHealthy,
}));
vi.mock('../../src/db/prisma', () => ({
  prisma: { firm: { findUnique: mocks.findFirm } },
  checkDatabaseConnection: mocks.dbHealthy,
}));
vi.mock('../../src/modules/tenancy/tenancy.repository', () => ({
  findActiveMembership: mocks.findActiveMembership,
  listActiveMemberships: vi.fn().mockResolvedValue([]),
}));
vi.mock('../../src/modules/audit/audit.writer', () => ({
  recordAudit: mocks.recordAudit,
  recordAuditInTransaction: vi.fn(),
}));

const app = createApp();
const USER_ID = randomUUID();
const FIRM_ID = randomUUID();
const OTHER_FIRM_ID = randomUUID();

function token(sub = USER_ID) {
  return signAccessToken({ sub, typ: 'staff', sid: randomUUID() });
}

function expectProblem(body: Record<string, unknown>, status: number, code: string) {
  expect(body).toMatchObject({ status, code });
  expect(typeof body.traceId).toBe('string');
  expect(typeof body.type).toBe('string');
  expect(body).not.toHaveProperty('stack');
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.sessionExists.mockResolvedValue(1);
  mocks.findActiveMembership.mockResolvedValue(null);
});

describe('health', () => {
  it('liveness answers without touching dependencies', async () => {
    const res = await request(app).get('/health/live');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
    expect(mocks.dbHealthy).not.toHaveBeenCalled();
  });

  it('readiness reports 200 when dependencies are up', async () => {
    mocks.dbHealthy.mockResolvedValue(true);
    mocks.redisHealthy.mockResolvedValue(true);
    const res = await request(app).get('/health/ready');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok', checks: { database: true, redis: true } });
  });

  it('readiness reports 503 with booleans only — no connection details', async () => {
    mocks.dbHealthy.mockResolvedValue(false);
    mocks.redisHealthy.mockResolvedValue(true);
    const res = await request(app).get('/health/ready');
    expect(res.status).toBe(503);
    expect(res.body).toEqual({ status: 'unavailable', checks: { database: false, redis: true } });
  });
});

describe('error format', () => {
  it('unknown routes return RFC 9457 problem details with a trace id', async () => {
    const res = await request(app).get('/no-such-route');
    expect(res.status).toBe(404);
    expect(res.headers['content-type']).toContain('application/problem+json');
    expectProblem(res.body as Record<string, unknown>, 404, 'NOT_FOUND');
    expect(res.headers['x-request-id']).toBe((res.body as { traceId: string }).traceId);
  });

  it('database constraint errors become client errors without leaking schema details', async () => {
    const probe = express();
    probe.use(requestId);
    probe.get('/dup', () => {
      throw new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed on the fields: (`firmId`,`reference`)',
        {
          code: 'P2002',
          clientVersion: 'test',
          meta: { target: ['firmId', 'reference'] },
        },
      );
    });
    probe.get('/fk', () => {
      throw new Prisma.PrismaClientKnownRequestError(
        'Foreign key constraint violated: `Task_firmId_matterId_fkey`',
        {
          code: 'P2003',
          clientVersion: 'test',
        },
      );
    });
    probe.get('/boom', () => {
      throw new Error('connection string postgres://secret@db');
    });
    probe.use(errorHandler);

    const dup = await request(probe).get('/dup');
    expectProblem(dup.body as Record<string, unknown>, 409, 'CONFLICT');
    expect(JSON.stringify(dup.body)).not.toMatch(/reference|firmId/);

    const fk = await request(probe).get('/fk');
    expectProblem(fk.body as Record<string, unknown>, 422, 'INVALID_REFERENCE');
    expect(JSON.stringify(fk.body)).not.toMatch(/fkey/);

    const boom = await request(probe).get('/boom');
    expectProblem(boom.body as Record<string, unknown>, 500, 'INTERNAL');
    expect(JSON.stringify(boom.body)).not.toMatch(/secret|postgres/);
  });
});

describe('authentication on tenant routes', () => {
  const url = `/api/v1/firms/${FIRM_ID}/clients`;

  it('rejects a request with no token', async () => {
    const res = await request(app).get(url);
    expectProblem(res.body as Record<string, unknown>, 401, 'UNAUTHENTICATED');
    expect(mocks.findActiveMembership).not.toHaveBeenCalled();
  });

  it('rejects a forged or malformed token', async () => {
    const res = await request(app).get(url).set('Authorization', 'Bearer not.a.jwt');
    expectProblem(res.body as Record<string, unknown>, 401, 'UNAUTHENTICATED');
  });

  it('rejects a valid token whose session has been revoked', async () => {
    mocks.sessionExists.mockResolvedValue(0);
    const res = await request(app).get(url).set('Authorization', `Bearer ${token()}`);
    expectProblem(res.body as Record<string, unknown>, 401, 'UNAUTHENTICATED');
    expect(mocks.findActiveMembership).not.toHaveBeenCalled();
  });

  it('/me/firms requires authentication too', async () => {
    const res = await request(app).get('/api/v1/me/firms');
    expect(res.status).toBe(401);
  });
});

describe('tenant resolution', () => {
  it('checks membership for the token’s user and the URL’s firm — and nothing the client asserts', async () => {
    await request(app)
      .get(`/api/v1/firms/${OTHER_FIRM_ID}/clients`)
      .set('Authorization', `Bearer ${token()}`)
      .set('X-Firm-Id', FIRM_ID)
      .set('X-User-Id', randomUUID());
    expect(mocks.findActiveMembership).toHaveBeenCalledWith(USER_ID, OTHER_FIRM_ID);
  });

  it('answers 404 (not 403) for a firm the user is not a member of, and audits the attempt', async () => {
    const res = await request(app)
      .get(`/api/v1/firms/${OTHER_FIRM_ID}/clients`)
      .set('Authorization', `Bearer ${token()}`);
    expectProblem(res.body as Record<string, unknown>, 404, 'NOT_FOUND');
    expect(mocks.recordAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'tenant.access',
        outcome: 'DENIED',
        actorUserId: USER_ID,
        resourceType: 'firm',
        resourceId: OTHER_FIRM_ID,
      }),
    );
  });

  it('rejects a malformed firm id before any lookup', async () => {
    const res = await request(app)
      .get('/api/v1/firms/not-a-uuid/clients')
      .set('Authorization', `Bearer ${token()}`);
    expectProblem(res.body as Record<string, unknown>, 400, 'VALIDATION_FAILED');
    expect(mocks.findActiveMembership).not.toHaveBeenCalled();
  });

  it('serves the firm from the verified context for a member', async () => {
    mocks.findActiveMembership.mockResolvedValue({
      firmId: FIRM_ID,
      membershipId: 'm1',
      userId: USER_ID,
      role: 'FEE_EARNER',
    });
    mocks.findFirm.mockResolvedValue({ id: FIRM_ID, name: 'Harlow Reyes', slug: 'harlow-reyes' });
    const res = await request(app)
      .get(`/api/v1/firms/${FIRM_ID}`)
      .set('Authorization', `Bearer ${token()}`);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: FIRM_ID, membership: { id: 'm1', role: 'FEE_EARNER' } });
    expect(mocks.findFirm).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: FIRM_ID } }),
    );
  });

  it('rejects a firmId in a request body instead of trusting or silently ignoring it', async () => {
    mocks.findActiveMembership.mockResolvedValue({
      firmId: FIRM_ID,
      membershipId: 'm1',
      userId: USER_ID,
      role: 'FEE_EARNER',
    });
    const res = await request(app)
      .post(`/api/v1/firms/${FIRM_ID}/tasks`)
      .set('Authorization', `Bearer ${token()}`)
      .send({ title: 'Chase broker', firmId: OTHER_FIRM_ID });
    expectProblem(res.body as Record<string, unknown>, 400, 'VALIDATION_FAILED');
  });
});

describe('firm permission checks', () => {
  function run(
    role: 'OWNER' | 'ADMIN' | 'FEE_EARNER' | 'SUPPORT',
    permission: Parameters<typeof requireFirmPermission>[0],
  ) {
    const req = {
      tenant: { firmId: FIRM_ID, membershipId: 'm1', userId: USER_ID, role },
      ip: '127.0.0.1',
    };
    const next = vi.fn();
    return { promise: requireFirmPermission(permission)(req as never, {} as never, next), next };
  }

  it('allows a role that holds the permission', async () => {
    const { promise, next } = run('ADMIN', 'member:manage');
    await promise;
    expect(next).toHaveBeenCalledOnce();
  });

  it('denies with 403 and audits when the role lacks it', async () => {
    const { promise, next } = run('FEE_EARNER', 'member:manage');
    await expect(promise).rejects.toMatchObject({ status: 403, code: 'FORBIDDEN' });
    expect(next).not.toHaveBeenCalled();
    expect(mocks.recordAudit).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'permission.check', outcome: 'DENIED', firmId: FIRM_ID }),
    );
  });

  it('fails closed when tenant context is missing', async () => {
    const next = vi.fn();
    await expect(
      requireFirmPermission('client:read')({} as never, {} as never, next),
    ).rejects.toThrow(/Tenant context missing/);
    expect(next).not.toHaveBeenCalled();
  });
});
