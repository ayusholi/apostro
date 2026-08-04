import type { Request, Response } from 'express';
import { sendCreated, sendNoContent, sendOk, sendPaginated } from '../../shared/response';
import { getValidated } from '../../validation/validate';
import type { ReorderInput } from '../../validation/common.schema';
import * as practiceAreasService from './practice-areas.service';
import type {
  CreatePracticeAreaInput,
  ListPracticeAreasQuery,
  UpdatePracticeAreaInput,
} from './practice-areas.schema';

export async function listPublicPracticeAreas(_req: Request, res: Response): Promise<void> {
  const practiceAreas = await practiceAreasService.listPublicPracticeAreas();
  sendOk(res, practiceAreas);
}

export async function getPublicPracticeArea(req: Request, res: Response): Promise<void> {
  const { slug } = getValidated<{ slug: string }>(req, 'params');
  const practiceArea = await practiceAreasService.getPublicPracticeArea(slug);
  sendOk(res, practiceArea);
}

export async function listPracticeAreasForAdmin(req: Request, res: Response): Promise<void> {
  const query = getValidated<ListPracticeAreasQuery>(req, 'query');
  const { data, pageInfo } = await practiceAreasService.listPracticeAreasForAdmin(query);
  sendPaginated(res, data, pageInfo);
}

export async function createPracticeArea(req: Request, res: Response): Promise<void> {
  const input = getValidated<CreatePracticeAreaInput>(req, 'body');
  const practiceArea = await practiceAreasService.createPracticeArea(input);
  sendCreated(res, practiceArea);
}

export async function getPracticeAreaForAdmin(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  const practiceArea = await practiceAreasService.getPracticeAreaForAdmin(id);
  sendOk(res, practiceArea);
}

export async function updatePracticeArea(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  const input = getValidated<UpdatePracticeAreaInput>(req, 'body');
  const practiceArea = await practiceAreasService.updatePracticeArea(id, input);
  sendOk(res, practiceArea);
}

export async function deletePracticeArea(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  await practiceAreasService.deletePracticeArea(id);
  sendNoContent(res);
}

export async function publishPracticeArea(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  const practiceArea = await practiceAreasService.publishPracticeArea(id);
  sendOk(res, practiceArea);
}

export async function unpublishPracticeArea(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  const practiceArea = await practiceAreasService.unpublishPracticeArea(id);
  sendOk(res, practiceArea);
}

export async function reorderPracticeAreas(req: Request, res: Response): Promise<void> {
  const input = getValidated<ReorderInput>(req, 'body');
  await practiceAreasService.reorderPracticeAreas(input);
  sendNoContent(res);
}
