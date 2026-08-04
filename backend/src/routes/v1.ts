import { Router } from 'express';
import { authRouter } from '../modules/auth/auth.routes';
import * as users from '../modules/users/users.routes';
import * as roles from '../modules/roles/roles.routes';
import * as appointments from '../modules/appointments/appointments.routes';
import * as enquiries from '../modules/enquiries/enquiries.routes';
import * as practiceAreas from '../modules/practice-areas/practice-areas.routes';
import * as solicitors from '../modules/solicitors/solicitors.routes';
import * as reviews from '../modules/reviews/reviews.routes';
import * as faq from '../modules/faq/faq.routes';
import * as blog from '../modules/blog/blog.routes';
import * as homepage from '../modules/homepage/homepage.routes';
import * as offices from '../modules/offices/offices.routes';
import * as media from '../modules/media/media.routes';
import * as notifications from '../modules/notifications/notifications.routes';
import * as audit from '../modules/audit/audit.routes';

/**
 * The /api/v1 composition point. Mounts every feature module under the
 * three security surfaces baked into the URL (API-DESIGN.md §0.1) plus
 * webhooks — auth, cache, and rate-limit policy differ per surface, so the
 * split is structural here, not just documentation.
 *
 * `auth` is the one exception: it predates the public/portal/admin split
 * (still mounted at `/auth`, staff-only, no MFA yet) and is left as-is —
 * migrating it to `/admin/auth` + `/portal/auth` per API-DESIGN.md §1 is
 * real behavior change, not scaffolding, and out of scope here.
 */
export const v1Router = Router();

v1Router.get('/', (_req, res) => {
  res.json({ name: 'ALLS Solicitors API', version: '0.1.0', docs: '/docs' });
});

v1Router.use('/auth', authRouter);

const publicRouter = Router();
publicRouter.use(appointments.publicRouter); // /availability, /bookings/*
publicRouter.use(enquiries.publicRouter); // /contact
publicRouter.use('/practice-areas', practiceAreas.publicRouter);
publicRouter.use('/solicitors', solicitors.publicRouter);
publicRouter.use(reviews.publicRouter); // /reviews*, /video-testimonials
publicRouter.use('/faqs', faq.publicRouter);
publicRouter.use('/blog', blog.publicRouter);
publicRouter.use('/homepage', homepage.publicRouter);
publicRouter.use('/offices', offices.publicRouter);
publicRouter.use(notifications.publicRouter); // /consent, /unsubscribe/:token

const portalRouter = Router();
portalRouter.use('/bookings', appointments.portalRouter);
portalRouter.use(reviews.portalRouter); // /reviews (POST)
portalRouter.use('/notifications', notifications.portalRouter);

const adminRouter = Router();
adminRouter.use('/users', users.adminRouter);
adminRouter.use('/roles', roles.adminRouter);
adminRouter.use('/permissions', roles.permissionsRouter);
adminRouter.use('/bookings', appointments.adminRouter);
adminRouter.use('/enquiries', enquiries.adminRouter);
adminRouter.use('/practice-areas', practiceAreas.adminRouter);
adminRouter.use('/solicitors', solicitors.adminRouter);
adminRouter.use('/reviews', reviews.adminReviewsRouter);
adminRouter.use('/video-testimonials', reviews.adminVideoTestimonialsRouter);
adminRouter.use('/faqs', faq.adminRouter);
adminRouter.use('/blog', blog.adminRouter);
adminRouter.use('/homepage', homepage.adminRouter);
adminRouter.use('/offices', offices.adminRouter);
adminRouter.use('/media', media.adminRouter);
adminRouter.use('/notifications', notifications.adminRouter);
adminRouter.use('/notification-templates', notifications.templatesAdminRouter);
adminRouter.use('/audit', audit.adminRouter);

const webhooksRouter = Router();
webhooksRouter.use(notifications.webhookRouter); // /notifications/:provider

v1Router.use('/public', publicRouter);
v1Router.use('/portal', portalRouter);
v1Router.use('/admin', adminRouter);
v1Router.use('/webhooks', webhooksRouter);
