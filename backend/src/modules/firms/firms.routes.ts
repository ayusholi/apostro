import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../validation/validate';
import * as controller from './firms.controller';
import { createFirmSchema } from './firms.schema';

/**
 * `POST /api/v1/firms` — onboarding. Outside the `/firms/:firmId` tenant
 * boundary because the firm doesn't exist yet. Auth is per route, so
 * requests for `/firms/:firmId/...` pass through untouched.
 */
export const firmsRouter = Router();

firmsRouter.post(
  '/',
  authenticate({ allow: ['staff'] }),
  validate({ body: createFirmSchema }),
  controller.createFirm,
);
