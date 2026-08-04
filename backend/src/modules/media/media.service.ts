import { AppError } from '../../shared/errors';
import type { ListMediaQuery, RequestUploadInput, UpdateMediaInput } from './media.schema';

/**
 * Media library — public assets only, direct-to-storage uploads via
 * pre-signed PUT (API-DESIGN.md §13, DATABASE-DESIGN.md §4.6). Not
 * implemented yet — `cms.MediaAsset`/`MediaVariant` have no Prisma model,
 * and there's no storage adapter (S3/MinIO client) wired in yet.
 */

export async function requestUpload(_input: RequestUploadInput): Promise<never> {
  throw AppError.notImplemented('Requesting a media upload is not implemented yet.');
}

export async function completeUpload(_id: string): Promise<never> {
  throw AppError.notImplemented('Completing a media upload is not implemented yet.');
}

export async function listMedia(_query: ListMediaQuery): Promise<never> {
  throw AppError.notImplemented('Listing media is not implemented yet.');
}

export async function getMedia(_id: string): Promise<never> {
  throw AppError.notImplemented('Fetching a media asset is not implemented yet.');
}

export async function updateMedia(_id: string, _input: UpdateMediaInput): Promise<never> {
  throw AppError.notImplemented('Updating a media asset is not implemented yet.');
}

export async function deleteMedia(_id: string): Promise<never> {
  throw AppError.notImplemented('Deleting a media asset is not implemented yet.');
}
