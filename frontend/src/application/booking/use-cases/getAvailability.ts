import { generateAvailableSlots } from "@/domain/booking/availability";
import { BookingPolicy } from "@/domain/booking/policy";
import { fail, ok, type Result } from "../dto";
import { resolveBookingContext } from "../resolveContext";
import type { BookingRepository, Clock, OfficeRepository, ServiceRepository, SolicitorRepository } from "../ports";
import { DomainError } from "@/domain/booking/errors";

export type GetAvailabilityDeps = {
  services: ServiceRepository;
  solicitors: SolicitorRepository;
  offices: OfficeRepository;
  bookings: BookingRepository;
  clock: Clock;
};

export type GetAvailabilityInput = {
  serviceSlug: string;
  solicitorSlug: string;
  officeId: string;
};

/**
 * Step 4 data source: every open slot's start time for this
 * service+solicitor+office combination, for the whole policy-allowed booking
 * window. Only `startUtc` is returned (not full TimeSlot objects) — the
 * duration is constant per service and already returned alongside, so the
 * client only ever needs a flat list of start times to group by day and
 * hand back whichever one gets clicked.
 */
export async function getAvailability(
  deps: GetAvailabilityDeps,
  input: GetAvailabilityInput,
): Promise<Result<{ slots: string[]; officeTimeZone: string; durationMinutes: number }>> {
  try {
    const ctx = await resolveBookingContext(deps, input);
    const existingBookings = await deps.bookings.findConfirmedSlotsForSolicitor(input.solicitorSlug);

    const slots = generateAvailableSlots({
      workingHours: ctx.solicitor.workingHours,
      officeTimeZone: ctx.office.timeZone,
      existingBookings,
      durationMinutes: ctx.service.durationMinutes,
      now: deps.clock.now(),
      minNoticeHours: BookingPolicy.minNoticeHours,
      maxAdvanceDays: BookingPolicy.maxAdvanceDays,
      slotIntervalMinutes: BookingPolicy.slotIntervalMinutes,
    });

    return ok({
      slots: slots.map((s) => s.startUtc),
      officeTimeZone: ctx.office.timeZone,
      durationMinutes: ctx.service.durationMinutes,
    });
  } catch (err) {
    if (err instanceof DomainError) return fail(err.code, err.message);
    throw err;
  }
}
