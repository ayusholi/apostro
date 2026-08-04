import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../validation/validate';
import * as controller from './appointments.controller';
import {
  adminCancelBookingSchema,
  adminCreateBookingSchema,
  availabilityQuerySchema,
  bookingIdParamSchema,
  cancelBookingSchema,
  createBookingSchema,
  listAdminBookingsQuerySchema,
  listPortalBookingsQuerySchema,
  manageTokenParamSchema,
  rescheduleBookingSchema,
  updateBookingSchema,
} from './appointments.schema';

/** `/api/v1/public/{availability,bookings}` (API-DESIGN.md §4.1) — 🟢 anonymous, capability-token past creation. */
export const publicRouter = Router();

publicRouter.get(
  '/availability',
  validate({ query: availabilityQuerySchema }),
  controller.getAvailability,
);
publicRouter.post(
  '/bookings',
  validate({ body: createBookingSchema }),
  controller.createPublicBooking,
);
publicRouter.get(
  '/bookings/manage/:manageToken',
  validate({ params: manageTokenParamSchema }),
  controller.getBookingByManageToken,
);
publicRouter.post(
  '/bookings/manage/:manageToken/cancel',
  validate({ params: manageTokenParamSchema, body: cancelBookingSchema }),
  controller.cancelBookingByManageToken,
);
publicRouter.post(
  '/bookings/manage/:manageToken/reschedule',
  validate({ params: manageTokenParamSchema, body: rescheduleBookingSchema }),
  controller.rescheduleBookingByManageToken,
);

/** `/api/v1/admin/bookings` (API-DESIGN.md §4.2) — 🔴 staff-only. */
export const adminRouter = Router();

adminRouter.use(authenticate({ allow: ['staff'] }));

adminRouter.get(
  '/',
  authorize('booking:read'),
  validate({ query: listAdminBookingsQuerySchema }),
  controller.listBookingsForAdmin,
);
adminRouter.get(
  '/:id',
  authorize('booking:read'),
  validate({ params: bookingIdParamSchema }),
  controller.getBookingForAdmin,
);
adminRouter.post(
  '/',
  authorize('booking:create'),
  validate({ body: adminCreateBookingSchema }),
  controller.createBookingForAdmin,
);
adminRouter.patch(
  '/:id',
  authorize('booking:update'),
  validate({ params: bookingIdParamSchema, body: updateBookingSchema }),
  controller.updateBookingForAdmin,
);
adminRouter.post(
  '/:id/cancel',
  authorize('booking:cancel'),
  validate({ params: bookingIdParamSchema, body: adminCancelBookingSchema }),
  controller.cancelBookingForAdmin,
);
adminRouter.post(
  '/:id/reschedule',
  authorize('booking:update'),
  validate({ params: bookingIdParamSchema, body: rescheduleBookingSchema }),
  controller.rescheduleBookingForAdmin,
);

/** `/api/v1/portal/bookings` (API-DESIGN.md §4.3) — 🔵 client, scoped to `clientId=self`. */
export const portalRouter = Router();

portalRouter.use(authenticate({ allow: ['client'] }));

portalRouter.get(
  '/',
  validate({ query: listPortalBookingsQuerySchema }),
  controller.listBookingsForClient,
);
portalRouter.get(
  '/:id',
  validate({ params: bookingIdParamSchema }),
  controller.getBookingForClient,
);
