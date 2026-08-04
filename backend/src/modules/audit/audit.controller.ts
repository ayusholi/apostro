import type { Request, Response } from 'express';
import { sendOk, sendPaginated } from '../../shared/response';
import { getValidated } from '../../validation/validate';
import * as auditService from './audit.service';
import type { ListAuditLogQuery } from './audit.schema';

export async function listAuditLog(req: Request, res: Response): Promise<void> {
  const query = getValidated<ListAuditLogQuery>(req, 'query');
  const { data, pageInfo } = await auditService.listAuditLog(query);
  sendPaginated(res, data, pageInfo);
}

export async function getAuditLogEntry(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  const entry = await auditService.getAuditLogEntry(id);
  sendOk(res, entry);
}
