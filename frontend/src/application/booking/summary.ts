import type { Booking } from "@/domain/booking/Booking";
import { BookingPolicy } from "@/domain/booking/policy";
import type { BookingSummary } from "./dto";
import type { BookingContext } from "./resolveContext";

export function toBookingSummary(booking: Booking, ctx: BookingContext, now: Date): BookingSummary {
  const startMs = Date.parse(booking.slot.startUtc);
  const isPast = startMs <= now.getTime();
  const hoursUntil = (startMs - now.getTime()) / 3_600_000;
  const canModify = booking.status === "confirmed" && !isPast && hoursUntil >= BookingPolicy.cancellationWindowHours;

  return {
    id: booking.id,
    manageToken: booking.manageToken,
    status: booking.status,
    serviceSlug: ctx.service.slug,
    serviceTitle: ctx.service.title,
    solicitorSlug: ctx.solicitor.slug,
    solicitorName: ctx.solicitor.name,
    officeId: ctx.office.id,
    officeName: ctx.office.name,
    officeAddress: ctx.office.address,
    slotStartUtc: booking.slot.startUtc,
    slotEndUtc: booking.slot.endUtc,
    displayTimeZone: booking.displayTimeZone,
    client: booking.client,
    createdAt: booking.createdAt,
    cancelledAt: booking.cancelledAt,
    isPast,
    canModify,
  };
}
