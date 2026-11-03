import { Router } from 'express';
import { validate } from '../../validation/validate';
import { requireFirmPermission } from '../tenancy/tenancy.middleware';
import * as controller from './matters.controller';
import {
  listActivityQuerySchema,
  listMatterTasksQuerySchema,
  matterIdParamSchema,
} from './matters.schema';

/** `/api/v1/firms/:firmId/matters` — mounted under firmRouter (tenant verified). */
export const mattersRouter = Router({ mergeParams: true });

mattersRouter.use(requireFirmPermission('matter:read'));

mattersRouter.get('/:matterId', validate({ params: matterIdParamSchema }), controller.getMatter);
mattersRouter.get(
  '/:matterId/tasks',
  requireFirmPermission('task:read'),
  validate({ params: matterIdParamSchema, query: listMatterTasksQuerySchema }),
  controller.listMatterTasks,
);
mattersRouter.get(
  '/:matterId/activity',
  validate({ params: matterIdParamSchema, query: listActivityQuerySchema }),
  controller.listMatterActivity,
);
