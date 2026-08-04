import { z } from 'zod';
import { cursorPaginationQuerySchema } from '../../validation/common.schema';

const channelSchema = z.enum(['EMAIL', 'SMS']);
const notificationStatusSchema = z.enum([
  'PENDING',
  'SENT',
  'DELIVERED',
  'BOUNCED',
  'FAILED',
  'COMPLAINED',
]);

export const listNotificationsQuerySchema = cursorPaginationQuerySchema.extend({
  status: notificationStatusSchema.optional(),
  channel: channelSchema.optional(),
  category: z.enum(['TRANSACTIONAL', 'MARKETING']).optional(),
  clientId: z.string().uuid().optional(),
  bookingId: z.string().uuid().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  q: z.string().trim().min(1).optional(),
});
export type ListNotificationsQuery = z.infer<typeof listNotificationsQuerySchema>;

export const listPortalNotificationsQuerySchema = cursorPaginationQuerySchema;
export type ListPortalNotificationsQuery = z.infer<typeof listPortalNotificationsQuerySchema>;

export const notificationIdParamSchema = z.object({ id: z.string().uuid() });

export const templateSchema = z.object({
  key: z.string().trim().min(1).max(200),
  channel: channelSchema,
  category: z.enum(['TRANSACTIONAL', 'MARKETING']),
  subject: z.string().trim().max(300).optional(),
  bodyTemplate: z.string().trim().optional(),
  locale: z.string().trim().min(2).max(10),
});
export type TemplateInput = z.infer<typeof templateSchema>;

export const consentSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  channel: channelSchema,
  purpose: z.enum(['MARKETING_NEWSLETTER', 'MARKETING_UPDATES']),
  consentGiven: z.boolean(),
  source: z.string().trim().min(1).max(200),
});
export type ConsentInput = z.infer<typeof consentSchema>;

export const unsubscribeTokenParamSchema = z.object({ token: z.string().min(1) });

export const webhookProviderParamSchema = z.object({ provider: z.string().trim().min(1) });
