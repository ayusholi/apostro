import { AppError } from '../../shared/errors';
import { matterVisibility } from '../matters/matters.service';
import { forTenant, type TenantPrisma } from '../tenancy/tenantPrisma';
import type { TenantContext } from '../tenancy/tenancy.types';
import type { CreateTaskInput } from './tasks.schema';

const taskView = {
  id: true,
  title: true,
  description: true,
  status: true,
  dueAt: true,
  matterId: true,
  clientId: true,
  assigneeMembershipId: true,
  completedAt: true,
  createdAt: true,
} as const;

type Db = Pick<TenantPrisma, 'matter' | 'client' | 'firmMembership'>;

/**
 * Checks every referenced id exists *in this firm* (and, for matters, is
 * visible to the caller). A reference to another firm's record gets the
 * same answer as one that doesn't exist. The composite foreign keys would
 * reject it anyway; checking first gives a clear, field-level error.
 */
async function assertReferences(db: Db, ctx: TenantContext, input: CreateTaskInput): Promise<void> {
  const fieldErrors: Record<string, string[]> = {};
  const [matter, client, assignee] = await Promise.all([
    input.matterId
      ? db.matter.count({ where: { AND: [matterVisibility(ctx), { id: input.matterId }] } })
      : 1,
    input.clientId ? db.client.count({ where: { id: input.clientId } }) : 1,
    input.assigneeMembershipId
      ? db.firmMembership.count({ where: { id: input.assigneeMembershipId, status: 'ACTIVE' } })
      : 1,
  ]);
  if (!matter) fieldErrors['body.matterId'] = ['Matter not found.'];
  if (!client) fieldErrors['body.clientId'] = ['Client not found.'];
  if (!assignee) fieldErrors['body.assigneeMembershipId'] = ['Not an active member of this firm.'];

  if (Object.keys(fieldErrors).length) {
    throw new AppError({
      status: 422,
      code: 'INVALID_REFERENCE',
      detail: 'One or more referenced records do not exist.',
      fieldErrors,
    });
  }
}

export async function createTask(ctx: TenantContext, input: CreateTaskInput) {
  return forTenant(ctx).$transaction(async (tx) => {
    await assertReferences(tx, ctx, input);

    const task = await tx.task.create({
      data: {
        firmId: ctx.firmId,
        title: input.title,
        description: input.description,
        dueAt: input.dueAt,
        matterId: input.matterId,
        clientId: input.clientId,
        assigneeMembershipId: input.assigneeMembershipId ?? ctx.membershipId,
        createdByMembershipId: ctx.membershipId,
      },
      select: taskView,
    });

    if (task.matterId || task.clientId) {
      await tx.activityEvent.create({
        data: {
          firmId: ctx.firmId,
          type: 'TASK_CREATED',
          matterId: task.matterId,
          clientId: task.clientId,
          actorMembershipId: ctx.membershipId,
          summary: `Task created: ${task.title}`,
          subjectId: task.id,
        },
      });
    }
    return task;
  });
}

export async function completeTask(ctx: TenantContext, taskId: string) {
  return forTenant(ctx).$transaction(async (tx) => {
    const existing = await tx.task.findFirst({
      where: { id: taskId },
      select: { status: true, matterId: true, clientId: true, title: true },
    });
    if (!existing) throw AppError.notFound('Task not found.');
    if (existing.status !== 'OPEN') {
      throw AppError.conflict(`Task is already ${existing.status.toLowerCase()}.`);
    }

    // Conditional on still being OPEN, so two concurrent completions can't both win.
    const { count } = await tx.task.updateMany({
      where: { id: taskId, status: 'OPEN' },
      data: { status: 'DONE', completedAt: new Date() },
    });
    if (count === 0) throw AppError.conflict('Task was changed by someone else.');

    if (existing.matterId || existing.clientId) {
      await tx.activityEvent.create({
        data: {
          firmId: ctx.firmId,
          type: 'TASK_COMPLETED',
          matterId: existing.matterId,
          clientId: existing.clientId,
          actorMembershipId: ctx.membershipId,
          summary: `Task completed: ${existing.title}`,
          subjectId: taskId,
        },
      });
    }

    return tx.task.findFirstOrThrow({ where: { id: taskId }, select: taskView });
  });
}
