import { Router } from 'express';
import { validate } from '../../validation/validate';
import { requireFirmPermission } from '../tenancy/tenancy.middleware';
import * as controller from './clients.controller';
import { clientIdParamSchema, listClientsQuerySchema } from './clients.schema';

/** `/api/v1/firms/:firmId/clients` — mounted under firmRouter, so tenant context is already verified. */
export const clientsRouter = Router({ mergeParams: true });

clientsRouter.get(
  '/',
  requireFirmPermission('client:read'),
  validate({ query: listClientsQuerySchema }),
  controller.listClients,
);
clientsRouter.get(
  '/:clientId',
  requireFirmPermission('client:read'),
  validate({ params: clientIdParamSchema }),
  controller.getClient,
);
