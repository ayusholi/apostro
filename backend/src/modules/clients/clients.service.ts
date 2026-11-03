import type { Prisma } from '@prisma/client';
import { AppError } from '../../shared/errors';
import { decodeCursor, encodeCursor } from '../../shared/pagination';
import { listActivity, listMattersForClient } from '../matters/matters.service';
import { forTenant } from '../tenancy/tenantPrisma';
import type { TenantContext } from '../tenancy/tenancy.types';
import type { ListClientsQuery } from './clients.schema';

const clientSummary = {
  id: true,
  kind: true,
  status: true,
  displayName: true,
  email: true,
  phone: true,
  updatedAt: true,
} satisfies Prisma.ClientSelect;

/** Firm's clients by name, cursor-paginated on (displayName, id). */
export async function listClients(ctx: TenantContext, query: ListClientsQuery) {
  const db = forTenant(ctx);
  const filters: Prisma.ClientWhereInput[] = [];
  if (query.status) filters.push({ status: query.status });
  if (query.q) filters.push({ displayName: { contains: query.q, mode: 'insensitive' } });
  if (query.cursor) {
    const { sortValue, id } = decodeCursor(query.cursor);
    filters.push({
      OR: [
        { displayName: { gt: String(sortValue) } },
        { displayName: String(sortValue), id: { gt: id } },
      ],
    });
  }

  const rows = await db.client.findMany({
    where: { AND: filters },
    select: clientSummary,
    orderBy: [{ displayName: 'asc' }, { id: 'asc' }],
    take: query.limit + 1,
  });

  const page = rows.slice(0, query.limit);
  const last = page[page.length - 1];
  const hasNextPage = rows.length > query.limit;
  return {
    data: page,
    pageInfo: {
      hasNextPage,
      nextCursor:
        hasNextPage && last ? encodeCursor({ sortValue: last.displayName, id: last.id }) : null,
    },
  };
}

/** A client with the context the workspace shows alongside them. */
export async function getClient(ctx: TenantContext, clientId: string) {
  const client = await forTenant(ctx).client.findFirst({
    where: { id: clientId },
    select: { ...clientSummary, createdAt: true },
  });
  // Another firm's client is indistinguishable from a missing one.
  if (!client) throw AppError.notFound('Client not found.');

  const [matters, recentActivity] = await Promise.all([
    listMattersForClient(ctx, clientId),
    listActivity(ctx, { clientId }, 10),
  ]);
  return { ...client, matters, recentActivity };
}
