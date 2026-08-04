import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../validation/validate';
import { reorderSchema, uuidParamSchema } from '../../validation/common.schema';
import * as controller from './reviews.controller';
import {
  createReviewSchema,
  listAdminReviewsQuerySchema,
  listPublicReviewsQuerySchema,
  reviewIdParamSchema,
  reviewStatsQuerySchema,
  submitReviewSchema,
  updateReviewSchema,
  videoTestimonialSchema,
} from './reviews.schema';

/** `/api/v1/public/{reviews,video-testimonials}` (API-DESIGN.md §8.1) — 🟢 anonymous. */
export const publicRouter = Router();

publicRouter.get(
  '/reviews',
  validate({ query: listPublicReviewsQuerySchema }),
  controller.listPublicReviews,
);
publicRouter.get(
  '/reviews/stats',
  validate({ query: reviewStatsQuerySchema }),
  controller.getReviewStats,
);
publicRouter.post(
  '/reviews/:id/helpful',
  validate({ params: reviewIdParamSchema }),
  controller.markReviewHelpful,
);
publicRouter.get('/video-testimonials', controller.listVideoTestimonials);

/** `/api/v1/portal/reviews` (API-DESIGN.md §8.1) — 🔵 client. */
export const portalRouter = Router();

portalRouter.post(
  '/reviews',
  authenticate({ allow: ['client'] }),
  validate({ body: submitReviewSchema }),
  controller.submitReview,
);

/** `/api/v1/admin/reviews` (API-DESIGN.md §8.2) — 🔴 staff-only. */
export const adminReviewsRouter = Router();

adminReviewsRouter.use(authenticate({ allow: ['staff'] }));

adminReviewsRouter.get(
  '/',
  authorize('review:read'),
  validate({ query: listAdminReviewsQuerySchema }),
  controller.listReviewsForAdmin,
);
adminReviewsRouter.post(
  '/',
  authorize('review:create'),
  validate({ body: createReviewSchema }),
  controller.createReview,
);
adminReviewsRouter.patch(
  '/:id',
  authorize('review:update'),
  validate({ params: reviewIdParamSchema, body: updateReviewSchema }),
  controller.updateReview,
);
adminReviewsRouter.post(
  '/:id/approve',
  authorize('review:moderate'),
  validate({ params: reviewIdParamSchema }),
  controller.approveReview,
);
adminReviewsRouter.post(
  '/:id/reject',
  authorize('review:moderate'),
  validate({ params: reviewIdParamSchema }),
  controller.rejectReview,
);
adminReviewsRouter.post(
  '/:id/feature',
  authorize('review:update'),
  validate({ params: reviewIdParamSchema }),
  controller.featureReview,
);
adminReviewsRouter.post(
  '/:id/unfeature',
  authorize('review:update'),
  validate({ params: reviewIdParamSchema }),
  controller.unfeatureReview,
);
adminReviewsRouter.delete(
  '/:id',
  authorize('review:delete'),
  validate({ params: reviewIdParamSchema }),
  controller.deleteReview,
);

/** `/api/v1/admin/video-testimonials` (API-DESIGN.md §8.2) — 🔴 staff-only. */
export const adminVideoTestimonialsRouter = Router();

adminVideoTestimonialsRouter.use(authenticate({ allow: ['staff'] }));

adminVideoTestimonialsRouter.post(
  '/',
  authorize('review:update'),
  validate({ body: videoTestimonialSchema }),
  controller.createVideoTestimonial,
);
adminVideoTestimonialsRouter.put(
  '/reorder',
  authorize('review:update'),
  validate({ body: reorderSchema }),
  controller.reorderVideoTestimonials,
);
adminVideoTestimonialsRouter.patch(
  '/:id',
  authorize('review:update'),
  validate({ params: uuidParamSchema, body: videoTestimonialSchema }),
  controller.updateVideoTestimonial,
);
adminVideoTestimonialsRouter.delete(
  '/:id',
  authorize('review:update'),
  validate({ params: uuidParamSchema }),
  controller.deleteVideoTestimonial,
);
