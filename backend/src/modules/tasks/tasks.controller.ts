import type { Request, Response } from 'express';
import { sendCreated, sendOk } from '../../shared/response';
import { getValidated } from '../../validation/validate';
import { getTenant } from '../tenancy/tenancy.middleware';
import type { CreateTaskInput } from './tasks.schema';
import * as tasksService from './tasks.service';

export async function createTask(req: Request, res: Response): Promise<void> {
  const input = getValidated<CreateTaskInput>(req, 'body');
  sendCreated(res, await tasksService.createTask(getTenant(req), input));
}

export async function completeTask(req: Request, res: Response): Promise<void> {
  const { taskId } = getValidated<{ taskId: string }>(req, 'params');
  sendOk(res, await tasksService.completeTask(getTenant(req), taskId));
}
