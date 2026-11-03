import { prisma } from '../../db/prisma';
import { isRecord } from '../../shared/utils';
import type { TenantContext } from './tenancy.types';

/**
 * Application-level tenant scoping (ADR-002) — layer 2 of 3:
 *   1. resolveTenant() proves membership and builds the TenantContext.
 *   2. forTenant(ctx) — this file — forces every query on a tenant-owned
 *      model to carry the context's firmId, and refuses query shapes it
 *      can't prove are scoped.
 *   3. Composite (firmId, id) foreign keys make Postgres reject any row
 *      that references another firm's record, even if 1 and 2 were
 *      bypassed.
 *
 * Nested reads (`include`/`select` of relations) aren't rewritten here and
 * don't need to be: every relation between tenant-owned models is a
 * composite FK on the shared firmId, so following one can't leave the firm.
 *
 * Not covered, by design: `$queryRaw`/`$executeRaw` (must filter on firmId
 * by hand and be reviewed), and the base `prisma` client, which tenant
 * services must not use for tenant-owned models.
 */

/** Prisma model names that carry a required `firmId`. */
export const TENANT_MODELS: ReadonlySet<string> = new Set([
  'FirmMembership',
  'FirmInvitation',
  'Client',
  'Matter',
  'MatterClient',
  'Task',
  'Conversation',
  'Message',
  'MessageProviderRef',
  'ActivityEvent',
]);

const FILTERED_OPERATIONS = new Set([
  'findFirst',
  'findFirstOrThrow',
  'findMany',
  'count',
  'aggregate',
  'groupBy',
  'updateMany',
  'updateManyAndReturn',
  'deleteMany',
]);

/** Operations addressed by a unique key: allowed only via a firmId compound key. */
const UNIQUE_OPERATIONS = new Set([
  'findUnique',
  'findUniqueOrThrow',
  'update',
  'delete',
  'upsert',
]);

const CREATE_OPERATIONS = new Set(['create', 'createMany', 'createManyAndReturn']);

/**
 * Append-only platform tables a tenant transaction may write to, so the
 * record commits or rolls back with the change it describes. Rows are
 * stamped with the tenant's firmId; reading or changing them through this
 * client is still refused.
 */
const APPEND_ONLY_MODELS: ReadonlySet<string> = new Set(['AuditEvent']);

/** Thrown for a query the scoping layer can't prove is tenant-safe. A programming error → 500. */
export class TenantScopeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TenantScopeError';
  }
}

function withFirmData(data: unknown, firmId: string, model: string): Record<string, unknown> {
  if (!isRecord(data)) {
    throw new TenantScopeError(`${model}: create data must be an object.`);
  }
  if (data.firmId !== undefined && data.firmId !== firmId) {
    throw new TenantScopeError(`${model}: refusing to write a row for another firm.`);
  }
  if ('firm' in data) {
    throw new TenantScopeError(
      `${model}: set firmId via the tenant context, not a nested 'firm' write.`,
    );
  }
  return { ...data, firmId };
}

/** True when `where` targets a row through a compound unique key whose firmId is this tenant's. */
function isScopedUniqueWhere(where: unknown, firmId: string): boolean {
  if (!isRecord(where)) return false;
  return Object.entries(where).some(
    ([key, value]) => key.startsWith('firmId_') && isRecord(value) && value.firmId === firmId,
  );
}

/**
 * Rewrites (or rejects) one Prisma operation's args so it can only touch
 * `firmId`'s rows. Pure — unit-tested without a database.
 */
export function scopeArgs(
  model: string | undefined,
  operation: string,
  args: unknown,
  firmId: string,
): unknown {
  if (model && APPEND_ONLY_MODELS.has(model) && operation === 'create') {
    const input = isRecord(args) ? args : {};
    return { ...input, data: withFirmData(input.data, firmId, model) };
  }

  if (!model || !TENANT_MODELS.has(model)) {
    throw new TenantScopeError(
      `${model ?? 'raw'}.${operation}: not a tenant-owned model — use the base client deliberately.`,
    );
  }

  const input = isRecord(args) ? args : {};

  if (FILTERED_OPERATIONS.has(operation)) {
    const where = input.where;
    return { ...input, where: where === undefined ? { firmId } : { AND: [where, { firmId }] } };
  }

  if (CREATE_OPERATIONS.has(operation)) {
    const data = input.data;
    return {
      ...input,
      data: Array.isArray(data)
        ? data.map((row) => withFirmData(row, firmId, model))
        : withFirmData(data, firmId, model),
    };
  }

  if (UNIQUE_OPERATIONS.has(operation)) {
    if (!isScopedUniqueWhere(input.where, firmId)) {
      throw new TenantScopeError(
        `${model}.${operation}: address the row with a firmId compound key (e.g. { firmId_id: { firmId, id } }) or use a *Many/findFirst operation.`,
      );
    }
    if (operation === 'upsert') {
      return { ...input, create: withFirmData(input.create, firmId, model) };
    }
    return input;
  }

  throw new TenantScopeError(
    `${model}.${operation}: operation not supported by the tenant-scoped client.`,
  );
}

/**
 * A Prisma client bound to one tenant. Cheap to create per request — it
 * shares the base client's connection pool. Interactive transactions on it
 * (`$transaction(async (tx) => …)`) keep the same scoping.
 */
export function forTenant(ctx: TenantContext) {
  return prisma.$extends({
    name: 'tenant-scope',
    query: {
      $allModels: {
        $allOperations({ model, operation, args, query }) {
          return query(scopeArgs(model, operation, args, ctx.firmId) as typeof args);
        },
      },
    },
  });
}

export type TenantPrisma = ReturnType<typeof forTenant>;
