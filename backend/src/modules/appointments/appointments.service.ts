import { AppError } from '../../shared/errors';
import type {
  AdminCancelBookingInput,
  AdminCreateBookingInput,
  AvailabilityQuery,
  CancelBookingInput,
  CreateBookingInput,
  ListAdminBookingsQuery,
  ListPortalBookingsQuery,
  RescheduleBookingInput,
  UpdateBookingInput,
} from './appointments.schema';

/**
 * The booking domain — the "strong-consistency" module (BOOKING-DESIGN.md,
 * API-DESIGN.md §4). Not implemented yet; see appointments.repository.ts
 * for why. Public, admin, and portal surfaces all route through here so
 * the anti-enumeration rule (uniform 404 on a bad/expired `manageToken`,
 * §4.1) and the `EXCLUDE`-driven `SLOT_NO_LONGER_AVAILABLE` handling live
 * in one place rather than being duplicated per surface.
 */

// ── Public ───────────────────────────────────────────────────────────────

export async function getAvailability(_query: AvailabilityQuery): Promise<never> {
  throw AppError.notImplemented('Availability lookup is not implemented yet.');
}

export async function createPublicBooking(_input: CreateBookingInput): Promise<never> {
  throw AppError.notImplemented('Booking creation is not implemented yet.');
}

export async function getBookingByManageToken(_manageToken: string): Promise<never> {
  throw AppError.notImplemented('Booking lookup by manage token is not implemented yet.');
}

export async function cancelBookingByManageToken(
  _manageToken: string,
  _input: CancelBookingInput,
): Promise<never> {
  throw AppError.notImplemented('Cancelling a booking is not implemented yet.');
}

export async function rescheduleBookingByManageToken(
  _manageToken: string,
  _input: RescheduleBookingInput,
): Promise<never> {
  throw AppError.notImplemented('Rescheduling a booking is not implemented yet.');
}

// ── Admin ────────────────────────────────────────────────────────────────

export async function listBookingsForAdmin(_query: ListAdminBookingsQuery): Promise<never> {
  throw AppError.notImplemented('Listing bookings is not implemented yet.');
}

export async function getBookingForAdmin(_id: string): Promise<never> {
  throw AppError.notImplemented('Fetching a booking is not implemented yet.');
}

export async function createBookingForAdmin(_input: AdminCreateBookingInput): Promise<never> {
  throw AppError.notImplemented('Staff-created bookings are not implemented yet.');
}

export async function updateBookingForAdmin(
  _id: string,
  _input: UpdateBookingInput,
): Promise<never> {
  throw AppError.notImplemented('Updating a booking is not implemented yet.');
}

export async function cancelBookingForAdmin(
  _id: string,
  _input: AdminCancelBookingInput,
): Promise<never> {
  throw AppError.notImplemented('Cancelling a booking is not implemented yet.');
}

export async function rescheduleBookingForAdmin(
  _id: string,
  _input: RescheduleBookingInput,
): Promise<never> {
  throw AppError.notImplemented('Rescheduling a booking is not implemented yet.');
}

// ── Portal ───────────────────────────────────────────────────────────────

export async function listBookingsForClient(
  _clientId: string,
  _query: ListPortalBookingsQuery,
): Promise<never> {
  throw AppError.notImplemented('Listing a client’s bookings is not implemented yet.');
}

export async function getBookingForClient(_clientId: string, _id: string): Promise<never> {
  throw AppError.notImplemented('Fetching a booking is not implemented yet.');
}
