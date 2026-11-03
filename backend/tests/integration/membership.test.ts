import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../src/app';
import { prisma } from '../../src/db/prisma';
import { setEmailSender, type AuthEmailMessage } from '../../src/modules/auth/ports';
import { addMember, createFirm, createUser, tokenFor, unique } from './fixtures';

/**
 * Stage 2 onboarding against real Postgres + Redis: firm creation,
 * invitations and membership management, including the role rules, the
 * last-owner invariant under concurrency, and transactional audit.
 */
const app = createApp();
const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

const sent: AuthEmailMessage[] = [];
beforeAll(() => {
  setEmailSender((message) => {
    sent.push(message);
    return Promise.resolve();
  });
});
afterAll(() => {
  setEmailSender(() => Promise.resolve());
});

/** A firm with an owner, an admin and a fee earner, each with a token. */
async function staffedFirm() {
  const firm = await createFirm('Staffed Firm');
  const people = await Promise.all(
    (['OWNER', 'ADMIN', 'FEE_EARNER'] as const).map(async (role) => {
      const user = await createUser(`${role} person`);
      const member = await addMember(firm.id, user.id, role);
      return { user, member, token: await tokenFor(user.id) };
    }),
  );
  const [owner, admin, feeEarner] = people;
  return { firm, owner: owner!, admin: admin!, feeEarner: feeEarner! };
}

function lastTokenFor(email: string): string {
  const message = [...sent].reverse().find((m) => m.to === email);
  if (!message?.data.token) throw new Error(`No invitation email captured for ${email}`);
  return message.data.token;
}

async function invite(firmId: string, token: string, email: string, role = 'FEE_EARNER') {
  return request(app)
    .post(`/api/v1/firms/${firmId}/invitations`)
    .set(auth(token))
    .send({ email, role });
}

async function accept(token: string, inviteToken: string) {
  return request(app)
    .post('/api/v1/invitations/accept')
    .set(auth(token))
    .send({ token: inviteToken });
}

describe('creating a firm', () => {
  it('makes the caller its first owner, with an audit record', async () => {
    const user = await createUser('Founder');
    const token = await tokenFor(user.id);
    const name = `Founders ${unique('x')}`;

    const res = await request(app).post('/api/v1/firms').set(auth(token)).send({ name });
    expect(res.status).toBe(201);
    const body = res.body as { id: string; slug: string; membership: { role: string } };
    expect(body.membership.role).toBe('OWNER');
    expect(body.slug).toMatch(/^founders-/);

    const firms = await request(app).get('/api/v1/me/firms').set(auth(token));
    expect(
      (firms.body as { data: { firm: { id: string } }[] }).data.map((m) => m.firm.id),
    ).toContain(body.id);
    const audit = await prisma.auditEvent.findFirst({
      where: { action: 'firm.create', firmId: body.id, actorUserId: user.id },
    });
    expect(audit).not.toBeNull();
  });

  it('rejects a slug that is already taken, and a body firmId', async () => {
    const user = await createUser();
    const token = await tokenFor(user.id);
    const slug = unique('taken');
    expect(
      (await request(app).post('/api/v1/firms').set(auth(token)).send({ name: 'One', slug }))
        .status,
    ).toBe(201);
    const dup = await request(app)
      .post('/api/v1/firms')
      .set(auth(token))
      .send({ name: 'Two', slug });
    expect(dup.status).toBe(409);
    expect(dup.body).toMatchObject({ code: 'SLUG_TAKEN' });

    const extra = await request(app)
      .post('/api/v1/firms')
      .set(auth(token))
      .send({ name: 'Three', firmId: 'x' });
    expect(extra.status).toBe(400);
  });
});

describe('invitations', () => {
  let s: Awaited<ReturnType<typeof staffedFirm>>;
  beforeEach(async () => {
    s = await staffedFirm();
  });

  it('a fee earner cannot invite; an admin cannot invite an owner', async () => {
    expect((await invite(s.firm.id, s.feeEarner.token, `${unique('a')}@example.test`)).status).toBe(
      403,
    );
    const res = await invite(s.firm.id, s.admin.token, `${unique('b')}@example.test`, 'OWNER');
    expect(res.status).toBe(403);
    expect(res.body).toMatchObject({ code: 'OWNER_REQUIRED' });
  });

  it('invite → accept creates an active membership with the invited role', async () => {
    const invitee = await createUser('Invitee');
    const inviteeToken = await tokenFor(invitee.id);

    // Not a member yet.
    expect(
      (await request(app).get(`/api/v1/firms/${s.firm.id}`).set(auth(inviteeToken))).status,
    ).toBe(404);

    // Mixed case in the request; stored and matched lowercase.
    const res = await invite(s.firm.id, s.admin.token, invitee.email.toUpperCase(), 'SUPPORT');
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ email: invitee.email, role: 'SUPPORT' });
    expect(res.body).not.toHaveProperty('tokenHash');

    const accepted = await accept(inviteeToken, lastTokenFor(invitee.email));
    expect(accepted.status).toBe(200);
    expect(accepted.body).toMatchObject({
      firm: { id: s.firm.id },
      membership: { role: 'SUPPORT', status: 'ACTIVE' },
    });

    const firm = await request(app).get(`/api/v1/firms/${s.firm.id}`).set(auth(inviteeToken));
    expect(firm.status).toBe(200);

    const actions = await prisma.auditEvent.findMany({
      where: { firmId: s.firm.id, action: { in: ['invitation.create', 'invitation.accept'] } },
      select: { action: true },
    });
    expect(actions.map((a) => a.action).sort()).toEqual(['invitation.accept', 'invitation.create']);

    // Single use.
    expect((await accept(inviteeToken, lastTokenFor(invitee.email))).status).toBe(400);
  });

  it('only the invited email can accept', async () => {
    const invitee = await createUser('Invitee');
    const someoneElse = await createUser('Someone else');
    await invite(s.firm.id, s.admin.token, invitee.email);

    const res = await accept(await tokenFor(someoneElse.id), lastTokenFor(invitee.email));
    expect(res.status).toBe(403);
    expect(res.body).toMatchObject({ code: 'INVITATION_EMAIL_MISMATCH' });
  });

  it('re-inviting revokes the earlier link; revoked and expired links fail', async () => {
    const invitee = await createUser('Invitee');
    const inviteeToken = await tokenFor(invitee.id);

    await invite(s.firm.id, s.admin.token, invitee.email);
    const first = lastTokenFor(invitee.email);
    const second = await invite(s.firm.id, s.admin.token, invitee.email);
    expect(second.status).toBe(201);
    expect((await accept(inviteeToken, first)).status).toBe(400);

    // Explicit revocation.
    const revoked = await request(app)
      .delete(`/api/v1/firms/${s.firm.id}/invitations/${(second.body as { id: string }).id}`)
      .set(auth(s.admin.token));
    expect(revoked.status).toBe(204);
    expect((await accept(inviteeToken, lastTokenFor(invitee.email))).status).toBe(400);

    // Expiry.
    const third = await invite(s.firm.id, s.admin.token, invitee.email);
    await prisma.firmInvitation.update({
      where: { id: (third.body as { id: string }).id },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });
    expect((await accept(inviteeToken, lastTokenFor(invitee.email))).status).toBe(400);
  });

  it('cannot invite someone who is already a member', async () => {
    const res = await invite(s.firm.id, s.owner.token, s.feeEarner.user.email);
    expect(res.status).toBe(409);
    expect(res.body).toMatchObject({ code: 'ALREADY_MEMBER' });
  });

  it('another firm cannot see or revoke this firm’s invitations', async () => {
    const other = await staffedFirm();
    const created = await invite(s.firm.id, s.admin.token, `${unique('c')}@example.test`);
    const id = (created.body as { id: string }).id;

    // Through its own firm (id substitution) and through this firm's URL.
    expect(
      (
        await request(app)
          .delete(`/api/v1/firms/${other.firm.id}/invitations/${id}`)
          .set(auth(other.owner.token))
      ).status,
    ).toBe(404);
    expect(
      (
        await request(app)
          .delete(`/api/v1/firms/${s.firm.id}/invitations/${id}`)
          .set(auth(other.owner.token))
      ).status,
    ).toBe(404);
    const list = await request(app)
      .get(`/api/v1/firms/${other.firm.id}/invitations`)
      .set(auth(other.owner.token));
    expect((list.body as { data: { id: string }[] }).data.map((i) => i.id)).not.toContain(id);
  });

  it('a removed member can be invited back and keeps their membership id', async () => {
    await request(app)
      .delete(`/api/v1/firms/${s.firm.id}/members/${s.feeEarner.member.id}`)
      .set(auth(s.admin.token))
      .expect(204);

    await invite(s.firm.id, s.admin.token, s.feeEarner.user.email, 'SUPPORT').then((r) =>
      expect(r.status).toBe(201),
    );
    const res = await accept(s.feeEarner.token, lastTokenFor(s.feeEarner.user.email));
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      membership: { id: s.feeEarner.member.id, role: 'SUPPORT', status: 'ACTIVE' },
    });
  });
});

describe('managing members', () => {
  let s: Awaited<ReturnType<typeof staffedFirm>>;
  beforeEach(async () => {
    s = await staffedFirm();
  });

  const patch = (token: string, firmId: string, membershipId: string, body: object) =>
    request(app)
      .patch(`/api/v1/firms/${firmId}/members/${membershipId}`)
      .set(auth(token))
      .send(body);

  it('any member can list colleagues; removed members are hidden by default', async () => {
    await request(app)
      .delete(`/api/v1/firms/${s.firm.id}/members/${s.admin.member.id}`)
      .set(auth(s.owner.token))
      .expect(204);
    const res = await request(app)
      .get(`/api/v1/firms/${s.firm.id}/members`)
      .set(auth(s.feeEarner.token));
    expect(res.status).toBe(200);
    const ids = (res.body as { data: { id: string }[] }).data.map((m) => m.id);
    expect(ids).toEqual(expect.arrayContaining([s.owner.member.id, s.feeEarner.member.id]));
    expect(ids).not.toContain(s.admin.member.id);
  });

  it('a fee earner cannot change anyone', async () => {
    expect(
      (await patch(s.feeEarner.token, s.firm.id, s.admin.member.id, { role: 'SUPPORT' })).status,
    ).toBe(403);
  });

  it('an admin cannot touch an owner or promote anyone to owner', async () => {
    const onOwner = await patch(s.admin.token, s.firm.id, s.owner.member.id, {
      status: 'SUSPENDED',
    });
    expect(onOwner.body).toMatchObject({ code: 'OWNER_REQUIRED' });
    const promote = await patch(s.admin.token, s.firm.id, s.feeEarner.member.id, { role: 'OWNER' });
    expect(promote.body).toMatchObject({ code: 'OWNER_REQUIRED' });
  });

  it('nobody can change their own membership', async () => {
    const res = await patch(s.owner.token, s.firm.id, s.owner.member.id, { role: 'ADMIN' });
    expect(res.status).toBe(403);
    expect(res.body).toMatchObject({ code: 'CANNOT_MODIFY_SELF' });
  });

  it('a role change is applied and audited with from/to', async () => {
    const res = await patch(s.admin.token, s.firm.id, s.feeEarner.member.id, { role: 'SUPPORT' });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: s.feeEarner.member.id, role: 'SUPPORT' });
    const audit = await prisma.auditEvent.findFirst({
      where: { action: 'member.role_change', resourceId: s.feeEarner.member.id },
    });
    expect(audit).toMatchObject({
      firmId: s.firm.id,
      actorUserId: s.admin.user.id,
      metadata: { from: 'FEE_EARNER', to: 'SUPPORT' },
    });
  });

  it('suspension and removal cut access on the next request', async () => {
    const firmUrl = `/api/v1/firms/${s.firm.id}`;
    await patch(s.admin.token, s.firm.id, s.feeEarner.member.id, { status: 'SUSPENDED' });
    expect((await request(app).get(firmUrl).set(auth(s.feeEarner.token))).status).toBe(404);

    await patch(s.admin.token, s.firm.id, s.feeEarner.member.id, { status: 'ACTIVE' });
    expect((await request(app).get(firmUrl).set(auth(s.feeEarner.token))).status).toBe(200);

    await request(app)
      .delete(`${firmUrl}/members/${s.feeEarner.member.id}`)
      .set(auth(s.admin.token))
      .expect(204);
    expect((await request(app).get(firmUrl).set(auth(s.feeEarner.token))).status).toBe(404);
    // Removed is gone for management purposes.
    expect(
      (await patch(s.admin.token, s.firm.id, s.feeEarner.member.id, { role: 'SUPPORT' })).status,
    ).toBe(404);
  });

  it('another firm cannot change this firm’s members', async () => {
    const other = await staffedFirm();
    const res = await patch(other.owner.token, other.firm.id, s.feeEarner.member.id, {
      role: 'SUPPORT',
    });
    expect(res.status).toBe(404);
    const unchanged = await prisma.firmMembership.findUniqueOrThrow({
      where: { id: s.feeEarner.member.id },
    });
    expect(unchanged.role).toBe('FEE_EARNER');
  });

  it('two owners removing each other at once leave the firm with an owner', async () => {
    const second = await createUser('Second owner');
    const secondMember = await addMember(s.firm.id, second.id, 'OWNER');
    const secondToken = await tokenFor(second.id);

    const [a, b] = await Promise.all([
      request(app)
        .delete(`/api/v1/firms/${s.firm.id}/members/${secondMember.id}`)
        .set(auth(s.owner.token)),
      request(app)
        .delete(`/api/v1/firms/${s.firm.id}/members/${s.owner.member.id}`)
        .set(auth(secondToken)),
    ]);
    expect([a.status, b.status].sort()).toEqual([204, 403]);

    const owners = await prisma.firmMembership.count({
      where: { firmId: s.firm.id, role: 'OWNER', status: 'ACTIVE' },
    });
    expect(owners).toBe(1);
    // Only the change that committed was audited.
    const removals = await prisma.auditEvent.count({
      where: { firmId: s.firm.id, action: 'member.remove' },
    });
    expect(removals).toBe(1);
  });
});
