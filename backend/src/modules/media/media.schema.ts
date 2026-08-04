import { z } from 'zod';
import { cursorPaginationQuerySchema } from '../../validation/common.schema';

export const requestUploadSchema = z.object({
  filename: z.string().trim().min(1).max(300),
  mimeType: z.string().trim().min(1).max(200),
  byteSize: z.number().int().positive(),
});
export type RequestUploadInput = z.infer<typeof requestUploadSchema>;

export const updateMediaSchema = z.object({
  altText: z.string().trim().max(500).optional(),
  caption: z.string().trim().max(1000).optional(),
  title: z.string().trim().max(300).optional(),
});
export type UpdateMediaInput = z.infer<typeof updateMediaSchema>;

export const listMediaQuerySchema = cursorPaginationQuerySchema.extend({
  mimeType: z.string().trim().min(1).optional(),
  q: z.string().trim().min(1).optional(),
});
export type ListMediaQuery = z.infer<typeof listMediaQuerySchema>;

export const mediaIdParamSchema = z.object({ id: z.string().uuid() });
