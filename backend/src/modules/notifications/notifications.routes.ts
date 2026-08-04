import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../validation/validate';
import { uuidParamSchema } from '../../validation/common.schema';
import * as controller from './notifications.controller';
import {
  consentSchema,
  listNotificationsQuerySchema,
  listPortalNotificationsQuerySchema,
  notificationIdParamSchema,
  templateSchema,
  unsubscribeTokenParamSchema,
  webhookProviderParamSchema,
} from './notifications.schema';

/** `/api/v1/public/{consent,unsubscribe}` (API-DESIGN.md §15.3) — 🟢 anonymous, PECR/GDPR. */
export const publicRouter = Router();

publicRouter.post('/consent', validate({ body: consentSchema }), controller.recordConsent);
publicRouter.get(
  '/unsubscribe/:token',
  validate({ params: unsubscribeTokenParamSchema }),
  controller.unsubscribe,
);

/** `/api/v1/admin/notifications` (API-DESIGN.md §15.1) — 🔴 staff-only. */
export const adminRouter = Router();

adminRouter.use(authenticate({ allow: ['staff'] }));

adminRouter.get(
  '/',
  authorize('notification:read'),
  validate({ query: listNotificationsQuerySchema }),
  controller.listNotifications,
);
adminRouter.get(
  '/:id',
  authorize('notification:read'),
  validate({ params: notificationIdParamSchema }),
  controller.getNotification,
);
adminRouter.post(
  '/:id/resend',
  authorize('notification:send'),
  validate({ params: notificationIdParamSchema }),
  controller.resendNotification,
);

/** `/api/v1/admin/notification-templates` (API-DESIGN.md §15.1) — 🔴 staff-only. */
export const templatesAdminRouter = Router();

templatesAdminRouter.use(authenticate({ allow: ['staff'] }));

templatesAdminRouter.get('/', authorize('notification:manage'), controller.listTemplates);
templatesAdminRouter.post(
  '/',
  authorize('notification:manage'),
  validate({ body: templateSchema }),
  controller.createTemplate,
);
templatesAdminRouter.patch(
  '/:id',
  authorize('notification:manage'),
  validate({ params: uuidParamSchema, body: templateSchema }),
  controller.updateTemplate,
);

/** `/api/v1/portal/notifications` (API-DESIGN.md §15.2) — 🔵 client, scoped to `clientId=self`. */
export const portalRouter = Router();

portalRouter.get(
  '/',
  authenticate({ allow: ['client'] }),
  validate({ query: listPortalNotificationsQuerySchema }),
  controller.listNotificationsForClient,
);

/**
 * `/api/v1/webhooks/notifications/:provider` (API-DESIGN.md §15.4) —
 * signature-verified, not JWT-authenticated. No `authenticate()`/
 * `authorize()` here on purpose: the caller is Resend/Twilio, not a
 * principal. Signature verification is itself not implemented yet — this
 * route is scaffolded but must never accept an unverified body in
 * production (§15.4 "never trusts the body without verifying the signature").
 */
export const webhookRouter = Router();

webhookRouter.post(
  '/notifications/:provider',
  validate({ params: webhookProviderParamSchema }),
  controller.handleProviderWebhook,
);
