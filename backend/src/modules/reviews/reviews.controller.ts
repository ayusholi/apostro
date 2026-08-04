import type { Request, Response } from 'express';
import { AppError } from '../../shared/errors';
import { sendCreated, sendNoContent, sendOk, sendPaginated } from '../../shared/response';
import { getValidated } from '../../validation/validate';
import type { ReorderInput } from '../../validation/common.schema';
import * as reviewsService from './reviews.service';
import type {
  CreateReviewInput,
  ListAdminReviewsQuery,
  ListPublicReviewsQuery,
  ReviewStatsQuery,
  SubmitReviewInput,
  UpdateReviewInput,
  VideoTestimonialInput,
} from './reviews.schema';

export async function listPublicReviews(req: Request, res: Response): Promise<void> {
  const query = getValidated<ListPublicReviewsQuery>(req, 'query');
  const { data, pageInfo } = await reviewsService.listPublicReviews(query);
  sendPaginated(res, data, pageInfo);
}

export async function getReviewStats(req: Request, res: Response): Promise<void> {
  const query = getValidated<ReviewStatsQuery>(req, 'query');
  const stats = await reviewsService.getReviewStats(query);
  sendOk(res, stats);
}

export async function markReviewHelpful(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  const result = await reviewsService.markReviewHelpful(id);
  sendOk(res, result);
}

export async function listVideoTestimonials(_req: Request, res: Response): Promise<void> {
  const testimonials = await reviewsService.listVideoTestimonials();
  sendOk(res, testimonials);
}

export async function submitReview(req: Request, res: Response): Promise<void> {
  if (!req.principal) throw AppError.unauthenticated();
  const input = getValidated<SubmitReviewInput>(req, 'body');
  const review = await reviewsService.submitReview(req.principal.id, input);
  sendCreated(res, review);
}

export async function listReviewsForAdmin(req: Request, res: Response): Promise<void> {
  const query = getValidated<ListAdminReviewsQuery>(req, 'query');
  const { data, pageInfo } = await reviewsService.listReviewsForAdmin(query);
  sendPaginated(res, data, pageInfo);
}

export async function createReview(req: Request, res: Response): Promise<void> {
  const input = getValidated<CreateReviewInput>(req, 'body');
  const review = await reviewsService.createReview(input);
  sendCreated(res, review);
}

export async function updateReview(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  const input = getValidated<UpdateReviewInput>(req, 'body');
  const review = await reviewsService.updateReview(id, input);
  sendOk(res, review);
}

export async function approveReview(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  const review = await reviewsService.approveReview(id);
  sendOk(res, review);
}

export async function rejectReview(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  const review = await reviewsService.rejectReview(id);
  sendOk(res, review);
}

export async function featureReview(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  const review = await reviewsService.featureReview(id);
  sendOk(res, review);
}

export async function unfeatureReview(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  const review = await reviewsService.unfeatureReview(id);
  sendOk(res, review);
}

export async function deleteReview(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  await reviewsService.deleteReview(id);
  sendNoContent(res);
}

export async function createVideoTestimonial(req: Request, res: Response): Promise<void> {
  const input = getValidated<VideoTestimonialInput>(req, 'body');
  const testimonial = await reviewsService.createVideoTestimonial(input);
  sendCreated(res, testimonial);
}

export async function updateVideoTestimonial(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  const input = getValidated<VideoTestimonialInput>(req, 'body');
  const testimonial = await reviewsService.updateVideoTestimonial(id, input);
  sendOk(res, testimonial);
}

export async function deleteVideoTestimonial(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  await reviewsService.deleteVideoTestimonial(id);
  sendNoContent(res);
}

export async function reorderVideoTestimonials(req: Request, res: Response): Promise<void> {
  const input = getValidated<ReorderInput>(req, 'body');
  await reviewsService.reorderVideoTestimonials(input);
  sendNoContent(res);
}
