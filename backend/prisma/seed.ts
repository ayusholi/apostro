/**
 * Development seed — `npm run db:seed`. Every person, firm, address and
 * number here is fictional (example.com/.test emails, Ofcom drama-range
 * phone numbers). Mirrors the frontend prototype's firm so the two line up
 * when the UI is wired to the API.
 *
 * Idempotent: records are upserted on natural keys, so re-running doesn't
 * duplicate. Refuses to run in production.
 */
import { PrismaClient, type FirmRole } from '@prisma/client';
import argon2 from 'argon2';

if (process.env.NODE_ENV === 'production') {
  throw new Error('Refusing to seed a production database.');
}

const prisma = new PrismaClient();

/** Development-only password for every seeded user. Override with SEED_PASSWORD. */
const PASSWORD = process.env.SEED_PASSWORD ?? 'apostro-dev-password';

async function upsertUser(email: string, fullName: string, passwordHash: string) {
  return prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, fullName, passwordHash, status: 'ACTIVE', emailVerifiedAt: new Date() },
  });
}

async function upsertMember(firmId: string, userId: string, role: FirmRole) {
  return prisma.firmMembership.upsert({
    where: { firmId_userId: { firmId, userId } },
    update: {},
    create: { firmId, userId, role, status: 'ACTIVE' },
  });
}

async function upsertClient(
  firmId: string,
  displayName: string,
  data: { email?: string; phone?: string; kind?: 'INDIVIDUAL' | 'ORGANISATION' },
) {
  const existing = await prisma.client.findFirst({ where: { firmId, displayName } });
  return (
    existing ??
    prisma.client.create({
      data: {
        firmId,
        displayName,
        kind: data.kind ?? 'INDIVIDUAL',
        email: data.email,
        phone: data.phone,
      },
    })
  );
}

async function upsertMatter(
  firmId: string,
  reference: string,
  data: {
    title: string;
    matterType: string;
    stage: string;
    responsibleMembershipId: string;
    clientIds: string[];
  },
) {
  const existing = await prisma.matter.findUnique({
    where: { firmId_reference: { firmId, reference } },
  });
  if (existing) return existing;
  const matter = await prisma.matter.create({
    data: {
      firmId,
      reference,
      title: data.title,
      matterType: data.matterType,
      stage: data.stage,
      responsibleMembershipId: data.responsibleMembershipId,
      clients: { create: data.clientIds.map((clientId) => ({ clientId })) },
    },
  });
  await prisma.activityEvent.create({
    data: {
      firmId,
      type: 'MATTER_OPENED',
      matterId: matter.id,
      actorMembershipId: data.responsibleMembershipId,
      summary: 'Matter opened',
    },
  });
  return matter;
}

async function main() {
  const passwordHash = await argon2.hash(PASSWORD, { type: argon2.argon2id });

  // ── Firm 1: the prototype's firm ───────────────────────────────────────
  const firm = await prisma.firm.upsert({
    where: { slug: 'harlow-reyes' },
    update: {},
    create: { name: 'Harlow Reyes Solicitors', slug: 'harlow-reyes' },
  });

  const people = [
    ['priya.shah@harlow-reyes.example.com', 'Saul Goodman', 'FEE_EARNER'],
    ['daniel.okoro@harlow-reyes.example.com', 'Daniel Okoro', 'OWNER'],
    ['helen.marsh@harlow-reyes.example.com', 'Helen Marsh', 'FEE_EARNER'],
    ['tom.bennett@harlow-reyes.example.com', 'Tom Bennett', 'FEE_EARNER'],
    ['grace.lin@harlow-reyes.example.com', 'Grace Lin', 'SUPPORT'],
  ] as const;
  const members: Record<string, string> = {};
  for (const [email, name, role] of people) {
    const user = await upsertUser(email, name, passwordHash);
    members[name] = (await upsertMember(firm.id, user.id, role)).id;
  }

  const okafor = await upsertClient(firm.id, 'Amara Okafor', {
    email: 'amara.okafor@example.com',
    phone: '07700 900412',
  });
  const whitmore = await upsertClient(firm.id, 'James and Ruth Whitmore', {
    email: 'ruth.whitmore@example.com',
    phone: '07700 900583',
  });
  const northgate = await upsertClient(firm.id, 'Northgate Joinery Ltd', {
    email: 'mark@northgate-joinery.example.co.uk',
    kind: 'ORGANISATION',
  });

  const pro = await upsertMatter(firm.id, 'PRO/0142', {
    title: 'Purchase of 14 Elm Grove, London E10',
    matterType: 'Property',
    stage: 'Enquiries',
    responsibleMembershipId: members['Saul Goodman']!,
    clientIds: [okafor.id],
  });
  await upsertMatter(firm.id, 'WIL/0311', {
    title: 'Mirror wills and lasting powers of attorney',
    matterType: 'Wills & estates',
    stage: 'Client approval',
    responsibleMembershipId: members['Saul Goodman']!,
    clientIds: [whitmore.id],
  });
  await upsertMatter(firm.id, 'CIV/0219', {
    title: 'Northgate Joinery Ltd v Castlebrook Developments Ltd',
    matterType: 'Civil dispute',
    stage: 'Letter before claim',
    responsibleMembershipId: members['Daniel Okoro']!,
    clientIds: [northgate.id],
  });

  if (!(await prisma.task.count({ where: { firmId: firm.id } }))) {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await prisma.task.createMany({
      data: [
        {
          firmId: firm.id,
          title: 'Review local authority search',
          matterId: pro.id,
          assigneeMembershipId: members['Saul Goodman'],
          dueAt: new Date(),
        },
        {
          firmId: firm.id,
          title: 'Check replies to pre-contract enquiries',
          matterId: pro.id,
          assigneeMembershipId: members['Saul Goodman'],
          dueAt: tomorrow,
        },
        {
          firmId: firm.id,
          title: 'Chase broker for mortgage offer',
          matterId: pro.id,
          assigneeMembershipId: members['Grace Lin'],
        },
      ],
    });
  }

  if (!(await prisma.conversation.count({ where: { firmId: firm.id } }))) {
    const enquiry = await prisma.conversation.create({
      data: {
        firmId: firm.id,
        channel: 'WEB_FORM',
        kind: 'ENQUIRY',
        subject: 'Boundary dispute with neighbour',
        contactName: 'Callum Reid',
        contactAddress: 'callum.reid@example.com',
        awaitingResponseSince: new Date(),
        lastMessageAt: new Date(),
      },
    });
    await prisma.message.create({
      data: {
        firmId: firm.id,
        conversationId: enquiry.id,
        direction: 'INBOUND',
        deliveryStatus: 'RECEIVED',
        senderLabel: 'Callum Reid',
        bodyText:
          'My neighbour replaced the fence and it now sits about half a metre onto our side. Can you help?',
        occurredAt: new Date(),
      },
    });
  }

  // ── Firm 2: a separate tenant, for trying isolation by hand ────────────
  const other = await prisma.firm.upsert({
    where: { slug: 'castle-lane-law' },
    update: {},
    create: { name: 'Castle Lane Law', slug: 'castle-lane-law' },
  });
  const sam = await upsertUser('sam.carter@castle-lane.example.com', 'Sam Carter', passwordHash);
  const samMember = await upsertMember(other.id, sam.id, 'OWNER');
  const otherClient = await upsertClient(other.id, 'Jordan Ellis', {
    email: 'jordan.ellis@example.com',
  });
  await upsertMatter(other.id, 'FAM/0001', {
    title: 'Child arrangements — Ellis',
    matterType: 'Family',
    stage: 'Application',
    responsibleMembershipId: samMember.id,
    clientIds: [otherClient.id],
  });

  // eslint-disable-next-line no-console -- CLI output for the developer running the seed.
  console.log(
    `Seeded firms "${firm.slug}" (${firm.id}) and "${other.slug}" (${other.id}). ` +
      'All users share the development password (SEED_PASSWORD or the default in prisma/seed.ts).',
  );
}

main()
  .catch((err: unknown) => {
    // eslint-disable-next-line no-console -- CLI output.
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
