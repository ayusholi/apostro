import { Router } from 'express';
import { validate } from '../../validation/validate';
import { requireFirmPermission } from '../tenancy/tenancy.middleware';
import * as controller from './tasks.controller';
import { createTaskSchema, taskIdParamSchema } from './tasks.schema';

/** `/api/v1/firms/:firmId/tasks` — mounted under firmRouter (tenant verified). */
export const tasksRouter = Router({ mergeParams: true });

tasksRouter.use(requireFirmPermission('task:write'));

tasksRouter.post('/', validate({ body: createTaskSchema }), controller.createTask);
tasksRouter.post(
  '/:taskId/complete',
  validate({ params: taskIdParamSchema }),
  controller.completeTask,
);
