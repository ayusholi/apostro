import { randomUUID } from 'node:crypto';
import type { FirmRole, MembershipStatus } from '@prisma/client';
import { prisma } from '../../src/db/prisma';
import { redis } from '../../src/db/redis';
import { signAccessToken } from '../../src/shared/jwt';

/**
 * Fixtures for integration tests. Every run creates uniquely named records
 * instead of truncating tables, so tests never delete anything (and the
 * append-only audit table couldn't be truncated anyway).
 */
const run = randomUUID().slice(0, 8);
let counter = 0;
const unique = (label: string) => `${label}-${run}-${++counter}`;

export async function createUser(name = 'Test User') {
  return prisma.user.create({
    data: {
      email: `${unique('user')}@example.test`,
      // Not a usable credential — these users never log in; tests mint tokens directly.
      passwordHash: 'not-a-real-hash',
      fullName: name,
      status: 'ACTIVE',
    },
  });
}

export async function createFirm(name = 'Test Firm') {
  return prisma.firm.create({ data: { name, slug: unique('firm') } });
}

export async function addMember(
  firmId: string,
  userId: string,
  role: FirmRole = 'FEE_EARNER',
  status: MembershipStatus = 'ACTIVE',
) {
  return prisma.firmMembership.create({ data: { firmId, userId, role, status } });
}

/** A live session in Redis (what authenticate() checks) plus a signed access token. */
export async function tokenFor(userId: string): Promise<string> {
  const sid = randomUUID();
  await redis.set(`session:${sid}`, userId, 'EX', 600);
  return signAccessToken({ sub: userId, typ: 'staff', sid });
}

export async function createClient(firmId: string, displayName = 'Client') {
  return prisma.client.create({ data: { firmId, kind: 'INDIVIDUAL', displayName } });
}

export async function createMatter(
  firmId: string,
  clientId: string,
  responsibleMembershipId?: string,
) {
  return prisma.matter.create({
    data: {
      firmId,
      reference: unique('REF'),
      title: 'Test matter',
      matterType: 'Property',
      responsibleMembershipId,
      clients: { create: [{ clientId }] },
    },
  });
}

/** Two firms, each with a fee earner, a client and a matter — the standard isolation scenario. */
export async function twoFirms() {
  const [firmA, firmB, userA, userB] = await Promise.all([
    createFirm('Firm A'),
    createFirm('Firm B'),
    createUser('Alice A'),
    createUser('Bob B'),
  ]);
  const [memberA, memberB] = await Promise.all([
    addMember(firmA.id, userA.id),
    addMember(firmB.id, userB.id),
  ]);
  const [clientA, clientB] = await Promise.all([
    createClient(firmA.id, 'Client of A'),
    createClient(firmB.id, 'Client of B'),
  ]);
  const [matterA, matterB] = await Promise.all([
    createMatter(firmA.id, clientA.id, memberA.id),
    createMatter(firmB.id, clientB.id, memberB.id),
  ]);
  const [tokenA, tokenB] = await Promise.all([tokenFor(userA.id), tokenFor(userB.id)]);
  return {
    a: {
      firm: firmA,
      user: userA,
      member: memberA,
      client: clientA,
      matter: matterA,
      token: tokenA,
    },
    b: {
      firm: firmB,
      user: userB,
      member: memberB,
      client: clientB,
      matter: matterB,
      token: tokenB,
    },
  };
}

export { unique };
