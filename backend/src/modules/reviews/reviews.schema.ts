import { z } from 'zod';
import { cursorPaginationQuerySchema } from '../../validation/common.schema';

const reviewSourceSchema = z.enum(['SITE', 'GOOGLE']);
const reviewStatusSchema = z.enum(['PENDING', 'APPROVED', 'REJECTED']);

export const listPublicReviewsQuerySchema = cursorPaginationQuerySchema.extend({
  practiceArea: z.string().trim().min(1).optional(),
  source: reviewSourceSchema.optional(),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  featured: z.coerce.boolean().optional(),
  verified: z.coerce.boolean().optional(),
});
export type ListPublicReviewsQuery = z.infer<typeof listPublicReviewsQuerySchema>;

export const reviewStatsQuerySchema = z.object({
  practiceArea: z.string().trim().min(1).optional(),
});
export type ReviewStatsQuery = z.infer<typeof reviewStatsQuerySchema>;

export const submitReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(200).optional(),
  body: z.string().trim().min(1).max(5000),
  practiceAreaId: z.string().uuid().optional(),
});
export type SubmitReviewInput = z.infer<typeof submitReviewSchema>;

export const createReviewSchema = z.object({
  authorName: z.string().trim().min(1).max(200),
  authorImage: z.string().url().optional(),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(200).optional(),
  body: z.string().trim().min(1).max(5000),
  practiceAreaId: z.string().uuid().optional(),
  source: reviewSourceSchema.default('SITE'),
  reviewDate: z.coerce.date(),
});
export type CreateReviewInput = z.infer<typeof createReviewSchema>;

export const updateReviewSchema = createReviewSchema.partial();
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;

export const listAdminReviewsQuerySchema = cursorPaginationQuerySchema.extend({
  status: reviewStatusSchema.optional(),
  source: reviewSourceSchema.optional(),
  q: z.string().trim().min(1).optional(),
});
export type ListAdminReviewsQuery = z.infer<typeof listAdminReviewsQuerySchema>;

export const reviewIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const videoTestimonialSchema = z.object({
  authorName: z.string().trim().min(1).max(200),
  role: z.string().trim().min(1).max(200),
  posterImageId: z.string().uuid().optional(),
  videoUrl: z.string().url().optional(),
  caption: z.string().trim().max(500),
  rating: z.number().int().min(1).max(5),
});
export type VideoTestimonialInput = z.infer<typeof videoTestimonialSchema>;
