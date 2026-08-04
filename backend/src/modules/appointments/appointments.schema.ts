import { z } from 'zod';
import { cursorPaginationQuerySchema } from '../../validation/common.schema';

/** `business.Booking.status` (DATABASE-DESIGN.md §3.2). */
const bookingStatusSchema = z.enum(['CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW']);

export const availabilityQuerySchema = z.object({
  solicitor: z.string().trim().min(1),
  service: z.string().trim().min(1),
  office: z.string().uuid(),
  from: z.coerce.date(),
  to: z.coerce.date(),
  timeZone: z.string().trim().min(1),
});
export type AvailabilityQuery = z.infer<typeof availabilityQuerySchema>;

/** The render-timestamp HMAC signature is the anti-bot timing signal (API-DESIGN.md §4.1). */
const bookingContactFields = {
  practiceAreaSlug: z.string().trim().min(1),
  solicitorSlug: z.string().trim().min(1),
  officeId: z.string().uuid(),
  slotStartUtc: z.coerce.date(),
  slotEndUtc: z.coerce.date(),
  displayTimeZone: z.string().trim().min(1),
  clientName: z.string().trim().min(1).max(200),
  clientEmail: z.string().trim().toLowerCase().email(),
  clientPhone: z.string().trim().min(1).max(50),
  clientNotes: z.string().trim().max(2000).optional(),
  honeypot: z.string().max(0).optional(),
  renderedAtSignature: z.string().min(1),
};

export const createBookingSchema = z.object(bookingContactFields);
export type CreateBookingInput = z.infer<typeof createBookingSchema>;

export const adminCreateBookingSchema = z.object({
  ...bookingContactFields,
  clientId: z.string().uuid().optional(),
});
export type AdminCreateBookingInput = z.infer<typeof adminCreateBookingSchema>;

export const cancelBookingSchema = z.object({
  reason: z.string().trim().max(1000).optional(),
});
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;

export const adminCancelBookingSchema = z.object({
  reason: z.string().trim().min(1).max(1000),
});
export type AdminCancelBookingInput = z.infer<typeof adminCancelBookingSchema>;

export const rescheduleBookingSchema = z.object({
  slotStartUtc: z.coerce.date(),
  slotEndUtc: z.coerce.date(),
});
export type RescheduleBookingInput = z.infer<typeof rescheduleBookingSchema>;

export const updateBookingSchema = z.object({
  status: bookingStatusSchema.optional(),
  clientNotes: z.string().trim().max(2000).optional(),
});
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;

export const manageTokenParamSchema = z.object({
  manageToken: z.string().min(1),
});

export const bookingIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const listAdminBookingsQuerySchema = cursorPaginationQuerySchema.extend({
  status: bookingStatusSchema.optional(),
  solicitorId: z.string().uuid().optional(),
  officeId: z.string().uuid().optional(),
  practiceAreaId: z.string().uuid().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  clientEmail: z.string().trim().toLowerCase().email().optional(),
  q: z.string().trim().min(1).optional(),
});
export type ListAdminBookingsQuery = z.infer<typeof listAdminBookingsQuerySchema>;

export const listPortalBookingsQuerySchema = cursorPaginationQuerySchema.extend({
  status: bookingStatusSchema.optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});
export type ListPortalBookingsQuery = z.infer<typeof listPortalBookingsQuerySchema>;
