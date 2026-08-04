import type { Request, Response } from 'express';
import { AppError } from '../../shared/errors';
import { sendAccepted, sendCreated, sendOk, sendPaginated } from '../../shared/response';
import { getValidated } from '../../validation/validate';
import * as notificationsService from './notifications.service';
import type {
  ConsentInput,
  ListNotificationsQuery,
  ListPortalNotificationsQuery,
  TemplateInput,
} from './notifications.schema';

// ── Admin ────────────────────────────────────────────────────────────────

export async function listNotifications(req: Request, res: Response): Promise<void> {
  const query = getValidated<ListNotificationsQuery>(req, 'query');
  const { data, pageInfo } = await notificationsService.listNotifications(query);
  sendPaginated(res, data, pageInfo);
}

export async function getNotification(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  sendOk(res, await notificationsService.getNotification(id));
}

export async function resendNotification(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  await notificationsService.resendNotification(id);
  sendAccepted(res);
}

export async function listTemplates(_req: Request, res: Response): Promise<void> {
  sendOk(res, await notificationsService.listTemplates());
}

export async function createTemplate(req: Request, res: Response): Promise<void> {
  const input = getValidated<TemplateInput>(req, 'body');
  sendCreated(res, await notificationsService.createTemplate(input));
}

export async function updateTemplate(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  const input = getValidated<TemplateInput>(req, 'body');
  sendOk(res, await notificationsService.updateTemplate(id, input));
}

// ── Portal ───────────────────────────────────────────────────────────────

export async function listNotificationsForClient(req: Request, res: Response): Promise<void> {
  if (!req.principal) throw AppError.unauthenticated();
  const query = getValidated<ListPortalNotificationsQuery>(req, 'query');
  const { data, pageInfo } = await notificationsService.listNotificationsForClient(
    req.principal.id,
    query,
  );
  sendPaginated(res, data, pageInfo);
}

// ── Consent & unsubscribe ────────────────────────────────────────────────

export async function recordConsent(req: Request, res: Response): Promise<void> {
  const input = getValidated<ConsentInput>(req, 'body');
  await notificationsService.recordConsent(input, req.ip);
  sendAccepted(res);
}

export async function unsubscribe(req: Request, res: Response): Promise<void> {
  const { token } = getValidated<{ token: string }>(req, 'params');
  const result = await notificationsService.unsubscribe(token);
  sendOk(res, result);
}

// ── Webhooks ─────────────────────────────────────────────────────────────

export async function handleProviderWebhook(req: Request, res: Response): Promise<void> {
  const { provider } = getValidated<{ provider: string }>(req, 'params');
  await notificationsService.handleProviderWebhook(provider, req.body as unknown);
  sendOk(res, { received: true });
}
