import {
  BookingAlreadyCancelledError,
  BookingNotFoundError,
  CancellationWindowPassedError,
  DomainError,
} from "@/domain/booking/errors";
import { BookingPolicy } from "@/domain/booking/policy";
import { composeAdminCancellationEmail, composeCancellationEmail } from "../emailComposer";
import { fail, ok, type BookingSummary, type Result } from "../dto";
import { resolveBookingContext } from "../resolveContext";
import { toBookingSummary } from "../summary";
import type { BookingRepository, Clock, NotificationService, OfficeRepository, ServiceRepository, SolicitorRepository } from "../ports";

export type CancelBookingDeps = {
  bookings: BookingRepository;
  services: ServiceRepository;
  solicitors: SolicitorRepository;
  offices: OfficeRepository;
  notifications: NotificationService;
  clock: Clock;
};

export async function cancelBooking(deps: CancelBookingDeps, token: string): Promise<Result<BookingSummary>> {
  try {
    const booking = await deps.bookings.findByToken(token);
    if (!booking) throw new BookingNotFoundError();
    if (booking.status === "cancelled") throw new BookingAlreadyCancelledError();

    const now = deps.clock.now();
    const hoursUntilStart = (Date.parse(booking.slot.startUtc) - now.getTime()) / 3_600_000;
    if (hoursUntilStart < BookingPolicy.cancellationWindowHours) {
      throw new CancellationWindowPassedError(BookingPolicy.cancellationWindowHours);
    }

    booking.status = "cancelled";
    booking.cancelledAt = now.toISOString();
    await deps.bookings.save(booking);

    const ctx = await resolveBookingContext(deps, {
      serviceSlug: booking.serviceSlug,
      solicitorSlug: booking.solicitorSlug,
      officeId: booking.officeId,
    });

    const emailCtx = { booking, service: ctx.service, solicitor: ctx.solicitor, office: ctx.office };
    void Promise.all([
      deps.notifications.send(composeCancellationEmail(emailCtx)),
      deps.notifications.send(composeAdminCancellationEmail(emailCtx)),
    ]).catch((err) => console.error("[booking] cancellation notification failed for", booking.id, err));

    return ok(toBookingSummary(booking, ctx, now));
  } catch (err) {
    if (err instanceof DomainError) return fail(err.code, err.message);
    throw err;
  }
}
