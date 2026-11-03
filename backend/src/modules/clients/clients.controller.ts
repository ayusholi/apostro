import type { Request, Response } from 'express';
import { sendOk, sendPaginated } from '../../shared/response';
import { getValidated } from '../../validation/validate';
import { getTenant } from '../tenancy/tenancy.middleware';
import type { ListClientsQuery } from './clients.schema';
import * as clientsService from './clients.service';

export async function listClients(req: Request, res: Response): Promise<void> {
  const query = getValidated<ListClientsQuery>(req, 'query');
  const { data, pageInfo } = await clientsService.listClients(getTenant(req), query);
  sendPaginated(res, data, pageInfo);
}

export async function getClient(req: Request, res: Response): Promise<void> {
  const { clientId } = getValidated<{ clientId: string }>(req, 'params');
  sendOk(res, await clientsService.getClient(getTenant(req), clientId));
}
