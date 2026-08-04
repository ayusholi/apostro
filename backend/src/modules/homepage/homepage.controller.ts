import type { Request, Response } from 'express';
import { sendCreated, sendNoContent, sendOk } from '../../shared/response';
import { getValidated } from '../../validation/validate';
import type { ReorderInput } from '../../validation/common.schema';
import * as homepageService from './homepage.service';
import type { FirmStatInput, FirmValueInput, UpdateSectionInput } from './homepage.schema';

export async function getPublicHomepage(_req: Request, res: Response): Promise<void> {
  sendOk(res, await homepageService.getPublicHomepage());
}

export async function listSections(_req: Request, res: Response): Promise<void> {
  sendOk(res, await homepageService.listSections());
}

export async function updateSection(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  const input = getValidated<UpdateSectionInput>(req, 'body');
  sendOk(res, await homepageService.updateSection(id, input));
}

export async function reorderSections(req: Request, res: Response): Promise<void> {
  const input = getValidated<ReorderInput>(req, 'body');
  await homepageService.reorderSections(input);
  sendNoContent(res);
}

export async function listFirmValues(_req: Request, res: Response): Promise<void> {
  sendOk(res, await homepageService.listFirmValues());
}

export async function createFirmValue(req: Request, res: Response): Promise<void> {
  const input = getValidated<FirmValueInput>(req, 'body');
  sendCreated(res, await homepageService.createFirmValue(input));
}

export async function updateFirmValue(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  const input = getValidated<FirmValueInput>(req, 'body');
  sendOk(res, await homepageService.updateFirmValue(id, input));
}

export async function deleteFirmValue(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  await homepageService.deleteFirmValue(id);
  sendNoContent(res);
}

export async function reorderFirmValues(req: Request, res: Response): Promise<void> {
  const input = getValidated<ReorderInput>(req, 'body');
  await homepageService.reorderFirmValues(input);
  sendNoContent(res);
}

export async function listFirmStats(_req: Request, res: Response): Promise<void> {
  sendOk(res, await homepageService.listFirmStats());
}

export async function createFirmStat(req: Request, res: Response): Promise<void> {
  const input = getValidated<FirmStatInput>(req, 'body');
  sendCreated(res, await homepageService.createFirmStat(input));
}

export async function updateFirmStat(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  const input = getValidated<FirmStatInput>(req, 'body');
  sendOk(res, await homepageService.updateFirmStat(id, input));
}

export async function deleteFirmStat(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  await homepageService.deleteFirmStat(id);
  sendNoContent(res);
}

export async function reorderFirmStats(req: Request, res: Response): Promise<void> {
  const input = getValidated<ReorderInput>(req, 'body');
  await homepageService.reorderFirmStats(input);
  sendNoContent(res);
}
