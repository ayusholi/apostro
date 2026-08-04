/**
 * Persistence for the strong-consistency booking write path
 * (FOLDER-STRUCTURE.md §4): the `EXCLUDE`-constraint insert (catch the
 * violation → `SLOT_NO_LONGER_AVAILABLE`), availability queries, the
 * claim-before-send reminder `UPDATE`, and the reschedule transaction.
 *
 * Not implemented yet — `business.Booking` has no Prisma model or migration
 * (DATABASE-DESIGN.md §3.2, incl. the raw-SQL `EXCLUDE USING gist`
 * constraint, is design-only so far). This file exists so the module's
 * shape matches FOLDER-STRUCTURE.md §6 ahead of that migration; every
 * function is a stub until then.
 */

import { AppError } from '../../shared/errors';
import type {
  AdminCreateBookingInput,
  AvailabilityQuery,
  CreateBookingInput,
  ListAdminBookingsQuery,
  ListPortalBookingsQuery,
  RescheduleBookingInput,
  UpdateBookingInput,
} from './appointments.schema';

export async function findAvailability(_query: AvailabilityQuery): Promise<never> {
  throw AppError.notImplemented('Availability lookup is not implemented yet.');
}

/** Will need the `EXCLUDE`-violation catch → `SLOT_NO_LONGER_AVAILABLE` (DATABASE-DESIGN.md §3.2). */
export async function insertBooking(
  _input: CreateBookingInput | AdminCreateBookingInput,
): Promise<never> {
  throw AppError.notImplemented('Creating a booking is not implemented yet.');
}

export async function findBookingByManageTokenHash(_tokenHash: string): Promise<never> {
  throw AppError.notImplemented('Booking lookup by manage token is not implemented yet.');
}

export async function findBookingById(_id: string): Promise<never> {
  throw AppError.notImplemented('Booking lookup is not implemented yet.');
}

export async function listBookingsForAdmin(_query: ListAdminBookingsQuery): Promise<never> {
  throw AppError.notImplemented('Listing bookings is not implemented yet.');
}

export async function listBookingsForClient(
  _clientId: string,
  _query: ListPortalBookingsQuery,
): Promise<never> {
  throw AppError.notImplemented('Listing a client’s bookings is not implemented yet.');
}

export async function updateBooking(_id: string, _input: UpdateBookingInput): Promise<never> {
  throw AppError.notImplemented('Updating a booking is not implemented yet.');
}

export async function cancelBooking(_id: string, _reason: string | undefined): Promise<never> {
  throw AppError.notImplemented('Cancelling a booking is not implemented yet.');
}

/** The reschedule transaction: re-validate the new slot against the `EXCLUDE` constraint before committing (DATABASE-DESIGN.md §3.2). */
export async function rescheduleBooking(
  _id: string,
  _input: RescheduleBookingInput,
): Promise<never> {
  throw AppError.notImplemented('Rescheduling a booking is not implemented yet.');
}
