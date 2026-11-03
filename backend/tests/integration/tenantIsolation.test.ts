import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../../src/app';
import { prisma } from '../../src/db/prisma';
import { forTenant } from '../../src/modules/tenancy/tenantPrisma';
import { addMember, createFirm, createUser, tokenFor, twoFirms } from './fixtures';

/**
 * Tenant isolation over HTTP, against real Postgres + Redis. Firm A's user
 * tries every route at Firm B's data — through Firm A's URL (id
 * substitution) and through Firm B's URL (firm substitution).
 */
const app = createApp();
let s: Awaited<ReturnType<typeof twoFirms>>;

beforeAll(async () => {
  s = await twoFirms();
});

const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

describe('reads', () => {
  it('a member can read their own firm’s client, with matters and activity', async () => {
    const res = await request(app)
      .get(`/api/v1/firms/${s.a.firm.id}/clients/${s.a.client.id}`)
      .set(auth(s.a.token));
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: s.a.client.id, matters: [{ id: s.a.matter.id }] });
  });

  it('Firm A cannot read Firm B’s client by id through its own firm', async () => {
    const res = await request(app)
      .get(`/api/v1/firms/${s.a.firm.id}/clients/${s.b.client.id}`)
      .set(auth(s.a.token));
    expect(res.status).toBe(404);
  });

  it('Firm A cannot list Firm B’s clients by putting Firm B in the URL', async () => {
    const res = await request(app).get(`/api/v1/firms/${s.b.firm.id}/clients`).set(auth(s.a.token));
    expect(res.status).toBe(404);
    const denied = await prisma.auditEvent.findFirst({
      where: {
        action: 'tenant.access',
        outcome: 'DENIED',
        actorUserId: s.a.user.id,
        resourceId: s.b.firm.id,
      },
    });
    expect(denied).not.toBeNull();
  });

  it('a firm’s client list contains only its own clients', async () => {
    const res = await request(app)
      .get(`/api/v1/firms/${s.a.firm.id}/clients?limit=100`)
      .set(auth(s.a.token));
    expect(res.status).toBe(200);
    const ids = (res.body as { data: { id: string }[] }).data.map((c) => c.id);
    expect(ids).toContain(s.a.client.id);
    expect(ids).not.toContain(s.b.client.id);
  });

  it('Firm A cannot read Firm B’s matter, its tasks or its activity', async () => {
    for (const path of ['', '/tasks', '/activity']) {
      const res = await request(app)
        .get(`/api/v1/firms/${s.a.firm.id}/matters/${s.b.matter.id}${path}`)
        .set(auth(s.a.token));
      expect(res.status, path).toBe(404);
    }
  });
});

describe('writes', () => {
  it('creates a task on the firm’s own matter and records timeline activity', async () => {
    const res = await request(app)
      .post(`/api/v1/firms/${s.a.firm.id}/tasks`)
      .set(auth(s.a.token))
      .send({ title: 'Review search results', matterId: s.a.matter.id });
    expect(res.status).toBe(201);
    const task = res.body as { id: string; assigneeMembershipId: string };
    expect(task.assigneeMembershipId).toBe(s.a.member.id);

    const activity = await prisma.activityEvent.findFirst({
      where: { subjectId: task.id, type: 'TASK_CREATED' },
    });
    expect(activity).toMatchObject({ firmId: s.a.firm.id, matterId: s.a.matter.id });

    const done = await request(app)
      .post(`/api/v1/firms/${s.a.firm.id}/tasks/${task.id}/complete`)
      .set(auth(s.a.token));
    expect(done.status).toBe(200);
    expect(done.body).toMatchObject({ status: 'DONE' });
    const again = await request(app)
      .post(`/api/v1/firms/${s.a.firm.id}/tasks/${task.id}/complete`)
      .set(auth(s.a.token));
    expect(again.status).toBe(409);
  });

  it('Firm A cannot create a task on Firm B’s matter, client or member', async () => {
    const before = await prisma.task.count({ where: { firmId: s.a.firm.id } });
    for (const field of [
      { matterId: s.b.matter.id },
      { clientId: s.b.client.id },
      { assigneeMembershipId: s.b.member.id },
    ]) {
      const res = await request(app)
        .post(`/api/v1/firms/${s.a.firm.id}/tasks`)
        .set(auth(s.a.token))
        .send({ title: 'Cross-tenant attempt', ...field });
      expect(res.status, JSON.stringify(field)).toBe(422);
      expect(res.body).toMatchObject({ code: 'INVALID_REFERENCE' });
    }
    expect(await prisma.task.count({ where: { firmId: s.a.firm.id } })).toBe(before);
  });

  it('Firm A cannot complete Firm B’s task', async () => {
    const taskB = await prisma.task.create({ data: { firmId: s.b.firm.id, title: 'B task' } });
    const res = await request(app)
      .post(`/api/v1/firms/${s.a.firm.id}/tasks/${taskB.id}/complete`)
      .set(auth(s.a.token));
    expect(res.status).toBe(404);
    expect(await prisma.task.findUniqueOrThrow({ where: { id: taskB.id } })).toMatchObject({
      status: 'OPEN',
    });
  });
});

describe('membership and active-firm context', () => {
  it('a user in two firms can work in each — and only those', async () => {
    const both = await createUser('Two Firms');
    await addMember(s.a.firm.id, both.id, 'SUPPORT');
    await addMember(s.b.firm.id, both.id, 'ADMIN');
    const token = await tokenFor(both.id);

    const firms = await request(app).get('/api/v1/me/firms').set(auth(token));
    expect(
      (firms.body as { data: { firm: { id: string } }[] }).data.map((m) => m.firm.id).sort(),
    ).toEqual([s.a.firm.id, s.b.firm.id].sort());

    const inA = await request(app).get(`/api/v1/firms/${s.a.firm.id}`).set(auth(token));
    const inB = await request(app).get(`/api/v1/firms/${s.b.firm.id}`).set(auth(token));
    expect(inA.body).toMatchObject({ membership: { role: 'SUPPORT' } });
    expect(inB.body).toMatchObject({ membership: { role: 'ADMIN' } });

    const elsewhere = await createFirm('Unrelated');
    expect((await request(app).get(`/api/v1/firms/${elsewhere.id}`).set(auth(token))).status).toBe(
      404,
    );
  });

  it.each(['INVITED', 'SUSPENDED', 'REMOVED'] as const)(
    'a %s membership grants no access',
    async (status) => {
      const user = await createUser();
      await addMember(s.a.firm.id, user.id, 'OWNER', status);
      const res = await request(app)
        .get(`/api/v1/firms/${s.a.firm.id}`)
        .set(auth(await tokenFor(user.id)));
      expect(res.status).toBe(404);
    },
  );

  it('a suspended firm grants no access, even to its owner', async () => {
    const firm = await createFirm('Suspended');
    const owner = await createUser();
    await addMember(firm.id, owner.id, 'OWNER');
    await prisma.firm.update({ where: { id: firm.id }, data: { status: 'SUSPENDED' } });
    const res = await request(app)
      .get(`/api/v1/firms/${firm.id}`)
      .set(auth(await tokenFor(owner.id)));
    expect(res.status).toBe(404);
  });
});

describe('tenant-scoped client (forTenant)', () => {
  const ctx = () => ({
    firmId: s.a.firm.id,
    membershipId: s.a.member.id,
    userId: s.a.user.id,
    role: 'FEE_EARNER' as const,
  });

  it('only ever returns the tenant’s rows, even when asked for another firm’s', async () => {
    const db = forTenant(ctx());
    expect(await db.client.findMany({ where: { id: s.b.client.id } })).toEqual([]);
    expect(await db.client.findMany({ where: { firmId: s.b.firm.id } })).toEqual([]);
    expect(await db.matter.count({ where: { id: s.b.matter.id } })).toBe(0);
  });

  it('bulk updates cannot touch another firm’s rows', async () => {
    const { count } = await forTenant(ctx()).client.updateMany({
      where: { id: s.b.client.id },
      data: { displayName: 'hijacked' },
    });
    expect(count).toBe(0);
    expect(
      (await prisma.client.findUniqueOrThrow({ where: { id: s.b.client.id } })).displayName,
    ).toBe('Client of B');
  });
});
