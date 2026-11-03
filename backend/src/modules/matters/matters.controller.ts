import type { Request, Response } from 'express';
import { sendOk } from '../../shared/response';
import { getValidated } from '../../validation/validate';
import { getTenant } from '../tenancy/tenancy.middleware';
import type { ListActivityQuery, ListMatterTasksQuery } from './matters.schema';
import * as mattersService from './matters.service';

export async function getMatter(req: Request, res: Response): Promise<void> {
  const { matterId } = getValidated<{ matterId: string }>(req, 'params');
  sendOk(res, await mattersService.getMatter(getTenant(req), matterId));
}

export async function listMatterTasks(req: Request, res: Response): Promise<void> {
  const { matterId } = getValidated<{ matterId: string }>(req, 'params');
  const { status } = getValidated<ListMatterTasksQuery>(req, 'query');
  sendOk(res, { data: await mattersService.listMatterTasks(getTenant(req), matterId, status) });
}

export async function listMatterActivity(req: Request, res: Response): Promise<void> {
  const { matterId } = getValidated<{ matterId: string }>(req, 'params');
  const { limit } = getValidated<ListActivityQuery>(req, 'query');
  sendOk(res, { data: await mattersService.listActivity(getTenant(req), { matterId }, limit) });
}
