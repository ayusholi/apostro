import { BookingNotFoundError, DomainError } from "@/domain/booking/errors";
import { fail, ok, type BookingSummary, type Result } from "../dto";
import { resolveBookingContext } from "../resolveContext";
import { toBookingSummary } from "../summary";
import type { BookingRepository, Clock, OfficeRepository, ServiceRepository, SolicitorRepository } from "../ports";

export type GetBookingByTokenDeps = {
  bookings: BookingRepository;
  services: ServiceRepository;
  solicitors: SolicitorRepository;
  offices: OfficeRepository;
  clock: Clock;
};

/** Powers the /booking/manage/[token] page — the only "read a single booking" entry point, deliberately keyed by the unguessable token rather than the booking id. */
export async function getBookingByToken(deps: GetBookingByTokenDeps, token: string): Promise<Result<BookingSummary>> {
  try {
    const booking = await deps.bookings.findByToken(token);
    if (!booking) throw new BookingNotFoundError();

    const ctx = await resolveBookingContext(deps, {
      serviceSlug: booking.serviceSlug,
      solicitorSlug: booking.solicitorSlug,
      officeId: booking.officeId,
    });

    return ok(toBookingSummary(booking, ctx, deps.clock.now()));
  } catch (err) {
    if (err instanceof DomainError) return fail(err.code, err.message);
    throw err;
  }
}
