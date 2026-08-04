import type { Request, Response } from 'express';
import { sendCreated, sendNoContent, sendOk, sendPaginated } from '../../shared/response';
import { getValidated } from '../../validation/validate';
import * as mediaService from './media.service';
import type { ListMediaQuery, RequestUploadInput, UpdateMediaInput } from './media.schema';

export async function requestUpload(req: Request, res: Response): Promise<void> {
  const input = getValidated<RequestUploadInput>(req, 'body');
  const ticket = await mediaService.requestUpload(input);
  sendCreated(res, ticket);
}

export async function completeUpload(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  const asset = await mediaService.completeUpload(id);
  sendOk(res, asset);
}

export async function listMedia(req: Request, res: Response): Promise<void> {
  const query = getValidated<ListMediaQuery>(req, 'query');
  const { data, pageInfo } = await mediaService.listMedia(query);
  sendPaginated(res, data, pageInfo);
}

export async function getMedia(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  const asset = await mediaService.getMedia(id);
  sendOk(res, asset);
}

export async function updateMedia(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  const input = getValidated<UpdateMediaInput>(req, 'body');
  const asset = await mediaService.updateMedia(id, input);
  sendOk(res, asset);
}

export async function deleteMedia(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  await mediaService.deleteMedia(id);
  sendNoContent(res);
}
