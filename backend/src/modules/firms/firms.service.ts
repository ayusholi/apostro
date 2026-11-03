import { Prisma } from '@prisma/client';
import { prisma } from '../../db/prisma';
import { AppError } from '../../shared/errors';
import { recordAuditInTransaction } from '../audit/audit.writer';
import { SLUG_PATTERN, type CreateFirmInput } from './firms.schema';

/** "Harlow & Reyes LLP" → "harlow-reyes-llp". Empty when nothing usable is left. */
export function slugify(name: string): string {
  return name
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/, '');
}

const slugTaken = () =>
  new AppError({
    status: 409,
    code: 'SLUG_TAKEN',
    detail: 'That firm handle is already in use.',
    fieldErrors: { 'body.slug': ['Already in use. Choose another.'] },
  });

/**
 * Creates a firm with the caller as its first OWNER (Stage 2 onboarding).
 * Firm, membership and audit record commit together. Uses the base client:
 * there is no tenant context until the firm exists.
 */
export async function createFirm(userId: string, input: CreateFirmInput) {
  const slug = input.slug ?? slugify(input.name);
  if (slug.length < 2 || !SLUG_PATTERN.test(slug)) {
    throw AppError.validation({ 'body.slug': ['Choose a handle for this firm.'] });
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { status: true, deletedAt: true },
      });
      if (!user || user.status !== 'ACTIVE' || user.deletedAt) throw AppError.forbidden();

      const firm = await tx.firm.create({
        data: { name: input.name, slug },
        select: { id: true, name: true, slug: true, createdAt: true },
      });
      const membership = await tx.firmMembership.create({
        data: { firmId: firm.id, userId, role: 'OWNER', status: 'ACTIVE' },
        select: { id: true, role: true },
      });
      await recordAuditInTransaction(tx, {
        action: 'firm.create',
        outcome: 'SUCCESS',
        firmId: firm.id,
        actorUserId: userId,
        resourceType: 'firm',
        resourceId: firm.id,
      });
      return { ...firm, membership };
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw slugTaken();
    }
    throw err;
  }
}
