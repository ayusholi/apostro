import type { Request, Response } from 'express';
import { sendCreated, sendNoContent, sendOk, sendPaginated } from '../../shared/response';
import { getValidated } from '../../validation/validate';
import type { ReorderInput } from '../../validation/common.schema';
import * as solicitorsService from './solicitors.service';
import type {
  CreateSolicitorInput,
  ListPublicSolicitorsQuery,
  ListSolicitorsQuery,
  SetRelationInput,
  UpdateSolicitorInput,
  WorkingHoursInput,
} from './solicitors.schema';

export async function listPublicSolicitors(req: Request, res: Response): Promise<void> {
  const query = getValidated<ListPublicSolicitorsQuery>(req, 'query');
  const solicitors = await solicitorsService.listPublicSolicitors(query);
  sendOk(res, solicitors);
}

export async function getPublicSolicitor(req: Request, res: Response): Promise<void> {
  const { slug } = getValidated<{ slug: string }>(req, 'params');
  const solicitor = await solicitorsService.getPublicSolicitor(slug);
  sendOk(res, solicitor);
}

export async function listSolicitorsForAdmin(req: Request, res: Response): Promise<void> {
  const query = getValidated<ListSolicitorsQuery>(req, 'query');
  const { data, pageInfo } = await solicitorsService.listSolicitorsForAdmin(query);
  sendPaginated(res, data, pageInfo);
}

export async function createSolicitor(req: Request, res: Response): Promise<void> {
  const input = getValidated<CreateSolicitorInput>(req, 'body');
  const solicitor = await solicitorsService.createSolicitor(input);
  sendCreated(res, solicitor);
}

export async function getSolicitorForAdmin(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  const solicitor = await solicitorsService.getSolicitorForAdmin(id);
  sendOk(res, solicitor);
}

export async function updateSolicitor(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  const input = getValidated<UpdateSolicitorInput>(req, 'body');
  const solicitor = await solicitorsService.updateSolicitor(id, input);
  sendOk(res, solicitor);
}

export async function deleteSolicitor(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  await solicitorsService.deleteSolicitor(id);
  sendNoContent(res);
}

export async function publishSolicitor(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  const solicitor = await solicitorsService.publishSolicitor(id);
  sendOk(res, solicitor);
}

export async function unpublishSolicitor(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  const solicitor = await solicitorsService.unpublishSolicitor(id);
  sendOk(res, solicitor);
}

export async function setSolicitorPracticeAreas(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  const input = getValidated<SetRelationInput>(req, 'body');
  const result = await solicitorsService.setSolicitorPracticeAreas(id, input);
  sendOk(res, result);
}

export async function setSolicitorOffices(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  const input = getValidated<SetRelationInput>(req, 'body');
  const result = await solicitorsService.setSolicitorOffices(id, input);
  sendOk(res, result);
}

export async function setSolicitorWorkingHours(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  const input = getValidated<WorkingHoursInput>(req, 'body');
  const solicitor = await solicitorsService.setSolicitorWorkingHours(id, input);
  sendOk(res, solicitor);
}

export async function reorderSolicitors(req: Request, res: Response): Promise<void> {
  const input = getValidated<ReorderInput>(req, 'body');
  await solicitorsService.reorderSolicitors(input);
  sendNoContent(res);
}
