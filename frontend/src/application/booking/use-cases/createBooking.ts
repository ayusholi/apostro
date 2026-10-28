import { makeSlot } from "@/domain/booking/TimeSlot";
import { BookingPolicy } from "@/domain/booking/policy";
import {
  DomainError,
  OutsideBookingWindowError,
  OutsideNoticeWindowError,
  RateLimitedError,
  SlotNoLongerAvailableError,
  SpamRejectedError,
} from "@/domain/booking/errors";
import type { Booking } from "@/domain/booking/Booking";
import { isKnownTimeZone } from "@/domain/scheduling/timezone";
import { composeAdminNewBookingEmail, composeConfirmationEmail } from "../emailComposer";
import { fail, ok, type CreateBookingInput, type Result } from "../dto";
import { resolveBookingContext } from "../resolveContext";
import { toBookingSummary } from "../summary";
import { zodFieldErrors, createBookingSchema } from "../validation";
import type {
  BookingRepository,
  Clock,
  IdGenerator,
  NotificationService,
  OfficeRepository,
  ServiceRepository,
  SolicitorRepository,
  SpamGuard,
} from "../ports";
import type { BookingSummary } from "../dto";

export type CreateBookingDeps = {
  services: ServiceRepository;
  solicitors: SolicitorRepository;
  offices: OfficeRepository;
  bookings: BookingRepository;
  notifications: NotificationService;
  spamGuard: SpamGuard;
  clock: Clock;
  ids: IdGenerator;
};

export async function createBooking(
  deps: CreateBookingDeps,
  rawInput: unknown,
  ipAddress: string,
): Promise<Result<BookingSummary>> {
  const parsed = createBookingSchema.safeParse(rawInput);
  if (!parsed.success) {
    return fail("VALIDATION_FAILED", "Please check the highlighted fields.", zodFieldErrors(parsed.error));
  }
  const input: CreateBookingInput = parsed.data;

  if (!isKnownTimeZone(input.displayTimeZone)) {
    return fail("VALIDATION_FAILED", "Please check the highlighted fields.", {
      displayTimeZone: ["Unrecognized timezone."],
    });
  }

  const now = deps.clock.now();

  const spamResult = await deps.spamGuard.evaluate(
    { honeypot: input.spam.honeypot, renderedAtMs: input.spam.renderedAtMs, ipAddress },
    now,
  );
  if (!spamResult.allowed) {
    const err = spamResult.reason === "rate_limited" ? new RateLimitedError() : new SpamRejectedError();
    return fail(err.code, err.message);
  }

  try {
    const ctx = await resolveBookingContext(deps, input);

    const slot = makeSlot(Date.parse(input.slotStartUtc), ctx.service.durationMinutes);
    const hoursUntilStart = (Date.parse(slot.startUtc) - now.getTime()) / 3_600_000;
    if (hoursUntilStart < BookingPolicy.minNoticeHours) throw new OutsideNoticeWindowError(BookingPolicy.minNoticeHours);
    if (hoursUntilStart > BookingPolicy.maxAdvanceDays * 24) throw new OutsideBookingWindowError(BookingPolicy.maxAdvanceDays);

    const booking: Booking = {
      id: deps.ids.newId(),
      manageToken: deps.ids.newToken(),
      status: "confirmed",
      serviceSlug: input.serviceSlug,
      solicitorSlug: input.solicitorSlug,
      officeId: input.officeId,
      slot,
      displayTimeZone: input.displayTimeZone,
      client: input.client,
      createdAt: now.toISOString(),
      cancelledAt: null,
      reminderSentAt: null,
      rescheduledFrom: null,
    };

    const inserted = await deps.bookings.createIfSlotFree(booking);
    if (!inserted) throw new SlotNoLongerAvailableError();

    // Notification failures must never undo an already-persisted booking —
    // the appointment is real even if the confirmation email bounces. Log
    // and move on; a production deploy would also push this to error
    // tracking (Sentry, etc.) rather than just console.error. Awaited (not
    // fire-and-forget) because on serverless the function can be frozen as
    // soon as the response is returned, dropping in-flight sends.
    const emailCtx = { booking, service: ctx.service, solicitor: ctx.solicitor, office: ctx.office };
    await Promise.all([
      deps.notifications.send(composeConfirmationEmail(emailCtx)),
      deps.notifications.send(composeAdminNewBookingEmail(emailCtx)),
    ]).catch((err) => console.error("[booking] notification failed for", booking.id, err));

    return ok(toBookingSummary(booking, ctx, now));
  } catch (err) {
    if (err instanceof DomainError) return fail(err.code, err.message);
    throw err;
  }
}
