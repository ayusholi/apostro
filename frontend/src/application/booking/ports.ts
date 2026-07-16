import type { Booking } from "@/domain/booking/Booking";
import type { TimeSlot } from "@/domain/booking/TimeSlot";
import type { WorkingHours } from "@/domain/scheduling/workingHours";

/**
 * Every interface a use case depends on. Use cases import ONLY from this
 * file (plus domain types) — never a concrete adapter. Swapping in-memory ->
 * Postgres, console-log -> Resend, or in-process rate limiting -> Redis means
 * writing one new class that implements one of these, and changing exactly
 * one line in `infrastructure/container.ts`.
 */

// ---- Catalog data (services / solicitors / offices) -----------------------

export type BookableService = {
  slug: string;
  title: string;
  durationMinutes: number;
};

export type Solicitor = {
  slug: string;
  name: string;
  image: string;
  serviceSlugs: string[];
  officeIds: string[];
  workingHours: WorkingHours;
};

export type Office = {
  id: string;
  name: string;
  address: string;
  timeZone: string;
};

export interface ServiceRepository {
  findAll(): Promise<BookableService[]>;
  findBySlug(slug: string): Promise<BookableService | undefined>;
}

export interface SolicitorRepository {
  findAll(): Promise<Solicitor[]>;
  findBySlug(slug: string): Promise<Solicitor | undefined>;
  findForService(serviceSlug: string): Promise<Solicitor[]>;
}

export interface OfficeRepository {
  findAll(): Promise<Office[]>;
  findById(id: string): Promise<Office | undefined>;
  findForSolicitor(solicitorSlug: string): Promise<Office[]>;
}

// ---- Bookings ---------------------------------------------------------------

export interface BookingRepository {
  /** Inserts iff no confirmed booking for the same solicitor overlaps `booking.slot` — the race-condition guard. Returns false if a conflict was found (caller should surface SlotNoLongerAvailableError). */
  createIfSlotFree(booking: Booking): Promise<boolean>;
  findByToken(token: string): Promise<Booking | undefined>;
  findById(id: string): Promise<Booking | undefined>;
  /** Confirmed bookings for a solicitor, used to compute availability (any office — a solicitor can't double-book across locations). */
  findConfirmedSlotsForSolicitor(solicitorSlug: string): Promise<TimeSlot[]>;
  save(booking: Booking): Promise<void>;
  /** Atomic reschedule: succeeds only if `newSlot` doesn't conflict with any OTHER confirmed booking for this solicitor (self excluded). Mirrors createIfSlotFree's race-condition guard for the update case. */
  rescheduleIfSlotFree(bookingId: string, newSlot: TimeSlot): Promise<boolean>;
  /** Confirmed, upcoming bookings starting within `withinHours` that haven't had a reminder sent yet. */
  findDueForReminder(withinHours: number, now: Date): Promise<Booking[]>;
}

// ---- Notifications ----------------------------------------------------------

export type EmailAttachment = { filename: string; content: string; contentType: string };
export type EmailMessage = {
  to: string;
  subject: string;
  html: string;
  text: string;
  attachments?: EmailAttachment[];
};

/** Deliberately just "send an email" — booking-aware composition happens in application/booking/emailComposer.ts, so this port is trivially swappable for Resend/SES/Postmark/nodemailer without touching booking logic. */
export interface NotificationService {
  send(message: EmailMessage): Promise<void>;
}

// ---- Spam / abuse guard -------------------------------------------------------

export type SpamCheckInput = {
  /** Value of the hidden honeypot field — must be empty. */
  honeypot: string;
  /** Timestamp (client-supplied, ms epoch) the form was rendered. */
  renderedAtMs: number;
  ipAddress: string;
};
export type SpamCheckResult = { allowed: true } | { allowed: false; reason: "honeypot" | "too_fast" | "rate_limited" };

export interface SpamGuard {
  evaluate(input: SpamCheckInput, now: Date): Promise<SpamCheckResult>;
}

// ---- System ------------------------------------------------------------------

export interface Clock {
  now(): Date;
}

export interface IdGenerator {
  newId(): string;
  /** Long, unguessable — used in the public manage/cancel/reschedule link. */
  newToken(): string;
}
