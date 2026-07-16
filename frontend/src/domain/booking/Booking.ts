import type { TimeSlot } from "./TimeSlot";

export type BookingStatus = "confirmed" | "cancelled";

export type Booking = {
  id: string;
  /** Long random token used in the manage/cancel/reschedule link — never the booking id (which may be sequential/guessable in a future DB). */
  manageToken: string;
  status: BookingStatus;

  serviceSlug: string;
  solicitorSlug: string;
  officeId: string;
  slot: TimeSlot;
  /** IANA zone the client had selected at booking time, so confirmation/reminder emails show the time they expect. */
  displayTimeZone: string;

  client: {
    name: string;
    email: string;
    phone: string;
    notes: string;
  };

  createdAt: string;
  cancelledAt: string | null;
  reminderSentAt: string | null;
  /** Set when this booking replaced an earlier slot via reschedule, for a lightweight audit trail. */
  rescheduledFrom: TimeSlot | null;
};

export function isUpcoming(booking: Booking, nowMs: number): boolean {
  return booking.status === "confirmed" && Date.parse(booking.slot.startUtc) > nowMs;
}
