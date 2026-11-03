import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../../src/app';
import { prisma } from '../../src/db/prisma';
import { addMember, createFirm, twoFirms, unique } from './fixtures';

/**
 * Database-level guarantees, exercised with the *base* client — i.e. with
 * the application's scoping deliberately bypassed. These are the backstop
 * if a future code path forgets forTenant().
 */
let s: Awaited<ReturnType<typeof twoFirms>>;

beforeAll(async () => {
  s = await twoFirms();
});

describe('cross-tenant references are rejected by Postgres', () => {
  it('a task in Firm A cannot point at Firm B’s matter, client or member', async () => {
    for (const ref of [
      { matterId: s.b.matter.id },
      { clientId: s.b.client.id },
      { assigneeMembershipId: s.b.member.id },
      { createdByMembershipId: s.b.member.id },
    ]) {
      await expect(
        prisma.task.create({ data: { firmId: s.a.firm.id, title: 'x', ...ref } }),
      ).rejects.toMatchObject({
        code: 'P2003',
      });
    }
  });

  it('a matter–client link cannot join two firms', async () => {
    await expect(
      prisma.matterClient.create({
        data: { firmId: s.a.firm.id, matterId: s.a.matter.id, clientId: s.b.client.id },
      }),
    ).rejects.toMatchObject({ code: 'P2003' });
  });

  it('a matter’s responsible person must be a member of the same firm', async () => {
    await expect(
      prisma.matter.create({
        data: {
          firmId: s.a.firm.id,
          reference: unique('X'),
          title: 'x',
          matterType: 'Family',
          responsibleMembershipId: s.b.member.id,
        },
      }),
    ).rejects.toMatchObject({ code: 'P2003' });
  });

  it('a message cannot be filed into another firm’s conversation', async () => {
    const convoB = await prisma.conversation.create({
      data: { firmId: s.b.firm.id, channel: 'EMAIL' },
    });
    await expect(
      prisma.message.create({
        data: {
          firmId: s.a.firm.id,
          conversationId: convoB.id,
          direction: 'INBOUND',
          deliveryStatus: 'RECEIVED',
          occurredAt: new Date(),
        },
      }),
    ).rejects.toMatchObject({ code: 'P2003' });
  });

  it('activity cannot be attached to another firm’s matter', async () => {
    await expect(
      prisma.activityEvent.create({
        data: { firmId: s.a.firm.id, type: 'NOTE_ADDED', matterId: s.b.matter.id, summary: 'x' },
      }),
    ).rejects.toMatchObject({ code: 'P2003' });
  });
});

describe('uniqueness', () => {
  it('matter references are unique per firm, not globally', async () => {
    const reference = unique('PRO');
    await prisma.matter.create({
      data: { firmId: s.a.firm.id, reference, title: 'one', matterType: 'Property' },
    });
    await expect(
      prisma.matter.create({
        data: { firmId: s.a.firm.id, reference, title: 'two', matterType: 'Property' },
      }),
    ).rejects.toMatchObject({ code: 'P2002' });
    await expect(
      prisma.matter.create({
        data: { firmId: s.b.firm.id, reference, title: 'other firm', matterType: 'Property' },
      }),
    ).resolves.toBeTruthy();
  });

  it('a user has at most one membership per firm', async () => {
    await expect(addMember(s.a.firm.id, s.a.user.id, 'ADMIN')).rejects.toMatchObject({
      code: 'P2002',
    });
  });

  it('firm slugs are unique', async () => {
    const firm = await createFirm();
    await expect(
      prisma.firm.create({ data: { name: 'dup', slug: firm.slug } }),
    ).rejects.toMatchObject({ code: 'P2002' });
  });

  it('a provider message id is recorded once per firm (ingestion idempotency)', async () => {
    const convo = await prisma.conversation.create({
      data: { firmId: s.a.firm.id, channel: 'EMAIL' },
    });
    const msg = await prisma.message.create({
      data: {
        firmId: s.a.firm.id,
        conversationId: convo.id,
        direction: 'INBOUND',
        deliveryStatus: 'RECEIVED',
        occurredAt: new Date(),
      },
    });
    const ref = {
      firmId: s.a.firm.id,
      messageId: msg.id,
      provider: 'gmail',
      providerMessageId: unique('gm'),
    };
    await prisma.messageProviderRef.create({ data: ref });
    await expect(prisma.messageProviderRef.create({ data: ref })).rejects.toMatchObject({
      code: 'P2002',
    });
  });
});

describe('CHECK constraints', () => {
  it('a task is DONE exactly when it has a completion time', async () => {
    await expect(
      prisma.task.create({ data: { firmId: s.a.firm.id, title: 'x', status: 'DONE' } }),
    ).rejects.toThrow();
    await expect(
      prisma.task.create({
        data: { firmId: s.a.firm.id, title: 'x', status: 'OPEN', completedAt: new Date() },
      }),
    ).rejects.toThrow();
  });

  it('a closed matter records when it closed', async () => {
    await expect(
      prisma.matter.create({
        data: {
          firmId: s.a.firm.id,
          reference: unique('C'),
          title: 'x',
          matterType: 'Family',
          status: 'CLOSED',
        },
      }),
    ).rejects.toThrow();
  });

  it('firm slugs must be lowercase and URL-safe', async () => {
    await expect(
      prisma.firm.create({ data: { name: 'x', slug: `Bad Slug ${unique('s')}` } }),
    ).rejects.toThrow();
  });

  it('required text cannot be blank', async () => {
    await expect(
      prisma.task.create({ data: { firmId: s.a.firm.id, title: '   ' } }),
    ).rejects.toThrow();
  });
});

describe('audit trail', () => {
  it('is append-only: updates and deletes are rejected by the database', async () => {
    const event = await prisma.auditEvent.create({
      data: { action: 'test.event', outcome: 'SUCCESS' },
    });
    await expect(
      prisma.auditEvent.update({ where: { id: event.id }, data: { action: 'tampered' } }),
    ).rejects.toThrow(/append-only/);
    await expect(prisma.auditEvent.delete({ where: { id: event.id } })).rejects.toThrow(
      /append-only/,
    );
    await expect(prisma.$executeRawUnsafe('TRUNCATE "audit"."AuditEvent"')).rejects.toThrow(
      /append-only/,
    );
    expect(await prisma.auditEvent.findUnique({ where: { id: event.id } })).toMatchObject({
      action: 'test.event',
    });
  });
});

describe('health against real dependencies', () => {
  it('readiness is 200 when Postgres and Redis are reachable', async () => {
    const res = await request(createApp()).get('/health/ready');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok', checks: { database: true, redis: true } });
  });
});
