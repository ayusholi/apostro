import type { Booking } from "@/domain/booking/Booking";

/**
 * Result envelope every use case returns. Errors are DATA, not thrown
 * exceptions crossing the Server Action -> client boundary — Next.js can't
 * serialize arbitrary Error subclasses back to a Client Component, and
 * "throw across the network" makes error-state UI harder to write than a
 * plain discriminated union does.
 */
export type ActionError = {
  code: string;
  message: string;
  fieldErrors?: Record<string, string[]>;
};
export type Result<T> = { ok: true; data: T } | { ok: false; error: ActionError };

export function ok<T>(data: T): Result<T> {
  return { ok: true, data };
}
export function fail<T>(code: string, message: string, fieldErrors?: Record<string, string[]>): Result<T> {
  return { ok: false, error: { code, message, fieldErrors } };
}

// ---- Request shapes ---------------------------------------------------------

export type CreateBookingInput = {
  serviceSlug: string;
  solicitorSlug: string;
  officeId: string;
  slotStartUtc: string;
  displayTimeZone: string;
  client: { name: string; email: string; phone: string; notes: string };
  spam: { honeypot: string; renderedAtMs: number };
};

export type RescheduleBookingInput = {
  token: string;
  newSlotStartUtc: string;
};

// ---- Response shapes ---------------------------------------------------------

export type BookingSummary = {
  id: string;
  manageToken: string;
  status: Booking["status"];
  serviceSlug: string;
  serviceTitle: string;
  solicitorSlug: string;
  solicitorName: string;
  officeId: string;
  officeName: string;
  officeAddress: string;
  slotStartUtc: string;
  slotEndUtc: string;
  displayTimeZone: string;
  client: Booking["client"];
  createdAt: string;
  cancelledAt: string | null;
  /** True once the appointment start time has passed. */
  isPast: boolean;
  /** Whether the cancellation/reschedule window has passed (policy-derived, computed server-side so the UI never has to reimplement the rule). */
  canModify: boolean;
};
