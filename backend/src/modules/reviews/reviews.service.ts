import { AppError } from '../../shared/errors';
import type { ReorderInput } from '../../validation/common.schema';
import type {
  CreateReviewInput,
  ListAdminReviewsQuery,
  ListPublicReviewsQuery,
  ReviewStatsQuery,
  SubmitReviewInput,
  UpdateReviewInput,
  VideoTestimonialInput,
} from './reviews.schema';

/**
 * Reviews + video testimonials (API-DESIGN.md §8, DATABASE-DESIGN.md §4.4).
 * Not implemented yet — `cms.Review`/`VideoTestimonial` have no Prisma
 * model, and `ReviewStats` depends on the materialized view §6 describes.
 */

export async function listPublicReviews(_query: ListPublicReviewsQuery): Promise<never> {
  throw AppError.notImplemented('Listing reviews is not implemented yet.');
}

export async function getReviewStats(_query: ReviewStatsQuery): Promise<never> {
  throw AppError.notImplemented('Review stats are not implemented yet.');
}

export async function markReviewHelpful(_id: string): Promise<never> {
  throw AppError.notImplemented('Marking a review helpful is not implemented yet.');
}

export async function listVideoTestimonials(): Promise<never> {
  throw AppError.notImplemented('Listing video testimonials is not implemented yet.');
}

export async function submitReview(_clientId: string, _input: SubmitReviewInput): Promise<never> {
  throw AppError.notImplemented('Submitting a review is not implemented yet.');
}

export async function listReviewsForAdmin(_query: ListAdminReviewsQuery): Promise<never> {
  throw AppError.notImplemented('Listing reviews is not implemented yet.');
}

export async function createReview(_input: CreateReviewInput): Promise<never> {
  throw AppError.notImplemented('Creating a review is not implemented yet.');
}

export async function updateReview(_id: string, _input: UpdateReviewInput): Promise<never> {
  throw AppError.notImplemented('Updating a review is not implemented yet.');
}

export async function approveReview(_id: string): Promise<never> {
  throw AppError.notImplemented('Approving a review is not implemented yet.');
}

export async function rejectReview(_id: string): Promise<never> {
  throw AppError.notImplemented('Rejecting a review is not implemented yet.');
}

export async function featureReview(_id: string): Promise<never> {
  throw AppError.notImplemented('Featuring a review is not implemented yet.');
}

export async function unfeatureReview(_id: string): Promise<never> {
  throw AppError.notImplemented('Unfeaturing a review is not implemented yet.');
}

export async function deleteReview(_id: string): Promise<never> {
  throw AppError.notImplemented('Deleting a review is not implemented yet.');
}

export async function createVideoTestimonial(_input: VideoTestimonialInput): Promise<never> {
  throw AppError.notImplemented('Creating a video testimonial is not implemented yet.');
}

export async function updateVideoTestimonial(
  _id: string,
  _input: VideoTestimonialInput,
): Promise<never> {
  throw AppError.notImplemented('Updating a video testimonial is not implemented yet.');
}

export async function deleteVideoTestimonial(_id: string): Promise<never> {
  throw AppError.notImplemented('Deleting a video testimonial is not implemented yet.');
}

export async function reorderVideoTestimonials(_input: ReorderInput): Promise<never> {
  throw AppError.notImplemented('Reordering video testimonials is not implemented yet.');
}
