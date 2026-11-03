import type { Request, Response } from 'express';
import { sendCreated } from '../../shared/response';
import { getValidated } from '../../validation/validate';
import type { CreateFirmInput } from './firms.schema';
import * as firmsService from './firms.service';

export async function createFirm(req: Request, res: Response): Promise<void> {
  const input = getValidated<CreateFirmInput>(req, 'body');
  sendCreated(res, await firmsService.createFirm(req.principal!.id, input));
}
