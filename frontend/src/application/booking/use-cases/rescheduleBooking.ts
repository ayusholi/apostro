import { makeSlot } from "@/domain/booking/TimeSlot";
import { BookingPolicy } from "@/domain/booking/policy";
import {
  BookingAlreadyCancelledError,
  BookingNotFoundError,
  CancellationWindowPassedError,
  DomainError,
  OutsideBookingWindowError,
  OutsideNoticeWindowError,
  SlotNoLongerAvailableError,
} from "@/domain/booking/errors";
import { composeAdminRescheduleEmail, composeRescheduleEmail } from "../emailComposer";
import { fail, ok, type BookingSummary, type Result, type RescheduleBookingInput } from "../dto";
import { resolveBookingContext } from "../resolveContext";
import { toBookingSummary } from "../summary";
import { rescheduleBookingSchema, zodFieldErrors } from "../validation";
import type { BookingRepository, Clock, NotificationService, OfficeRepository, ServiceRepository, SolicitorRepository } from "../ports";

export type RescheduleBookingDeps = {
  bookings: BookingRepository;
  services: ServiceRepository;
  solicitors: SolicitorRepository;
  offices: OfficeRepository;
  notifications: NotificationService;
  clock: Clock;
};

export async function rescheduleBooking(
  deps: RescheduleBookingDeps,
  rawInput: unknown,
): Promise<Result<BookingSummary>> {
  const parsed = rescheduleBookingSchema.safeParse(rawInput);
  if (!parsed.success) {
    return fail("VALIDATION_FAILED", "Please choose a valid time.", zodFieldErrors(parsed.error));
  }
  const input: RescheduleBookingInput = parsed.data;

  try {
    const booking = await deps.bookings.findByToken(input.token);
    if (!booking) throw new BookingNotFoundError();
    if (booking.status === "cancelled") throw new BookingAlreadyCancelledError();

    const now = deps.clock.now();
    const currentHoursUntilStart = (Date.parse(booking.slot.startUtc) - now.getTime()) / 3_600_000;
    if (currentHoursUntilStart < BookingPolicy.cancellationWindowHours) {
      throw new CancellationWindowPassedError(BookingPolicy.cancellationWindowHours);
    }

    const ctx = await resolveBookingContext(deps, {
      serviceSlug: booking.serviceSlug,
      solicitorSlug: booking.solicitorSlug,
      officeId: booking.officeId,
    });

    const newSlot = makeSlot(Date.parse(input.newSlotStartUtc), ctx.service.durationMinutes);
    const newHoursUntilStart = (Date.parse(newSlot.startUtc) - now.getTime()) / 3_600_000;
    if (newHoursUntilStart < BookingPolicy.minNoticeHours) throw new OutsideNoticeWindowError(BookingPolicy.minNoticeHours);
    if (newHoursUntilStart > BookingPolicy.maxAdvanceDays * 24) throw new OutsideBookingWindowError(BookingPolicy.maxAdvanceDays);

    const previousSlot = booking.slot;
    const succeeded = await deps.bookings.rescheduleIfSlotFree(booking.id, newSlot);
    if (!succeeded) throw new SlotNoLongerAvailableError();

    const updated = await deps.bookings.findByToken(input.token);
    if (!updated) throw new BookingNotFoundError();

    const emailCtx = { booking: updated, service: ctx.service, solicitor: ctx.solicitor, office: ctx.office };
    await Promise.all([
      deps.notifications.send(composeRescheduleEmail(emailCtx, previousSlot)),
      deps.notifications.send(composeAdminRescheduleEmail(emailCtx, previousSlot)),
    ]).catch((err) => console.error("[booking] reschedule notification failed for", updated.id, err));

    return ok(toBookingSummary(updated, ctx, now));
  } catch (err) {
    if (err instanceof DomainError) return fail(err.code, err.message);
    throw err;
  }
}
