import type { Request, Response } from 'express';
import { sendCreated, sendNoContent, sendOk, sendPaginated } from '../../shared/response';
import { getValidated } from '../../validation/validate';
import type { ReorderInput } from '../../validation/common.schema';
import * as officesService from './offices.service';
import type { CreateOfficeInput, ListOfficesQuery, UpdateOfficeInput } from './offices.schema';

export async function listPublicOffices(_req: Request, res: Response): Promise<void> {
  sendOk(res, await officesService.listPublicOffices());
}

export async function getPublicOffice(req: Request, res: Response): Promise<void> {
  const { slug } = getValidated<{ slug: string }>(req, 'params');
  sendOk(res, await officesService.getPublicOffice(slug));
}

export async function listOfficesForAdmin(req: Request, res: Response): Promise<void> {
  const query = getValidated<ListOfficesQuery>(req, 'query');
  const { data, pageInfo } = await officesService.listOfficesForAdmin(query);
  sendPaginated(res, data, pageInfo);
}

export async function createOffice(req: Request, res: Response): Promise<void> {
  const input = getValidated<CreateOfficeInput>(req, 'body');
  sendCreated(res, await officesService.createOffice(input));
}

export async function updateOffice(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  const input = getValidated<UpdateOfficeInput>(req, 'body');
  sendOk(res, await officesService.updateOffice(id, input));
}

export async function deleteOffice(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  await officesService.deleteOffice(id);
  sendNoContent(res);
}

export async function publishOffice(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  sendOk(res, await officesService.publishOffice(id));
}

export async function unpublishOffice(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  sendOk(res, await officesService.unpublishOffice(id));
}

export async function reorderOffices(req: Request, res: Response): Promise<void> {
  const input = getValidated<ReorderInput>(req, 'body');
  await officesService.reorderOffices(input);
  sendNoContent(res);
}
