import type { Booking } from "@/domain/booking/Booking";
import { slotsOverlap, type TimeSlot } from "@/domain/booking/TimeSlot";
import type { BookingRepository } from "@/application/booking/ports";

/**
 * Development/demo adapter. Two honest limitations, by design, until the
 * Postgres swap (see /prisma/README.md):
 *  1. State lives in process memory — it resets on every server restart and
 *     is NOT shared across multiple serverless instances. Fine for a single
 *     long-running Node process; not fine for a real multi-instance deploy.
 *  2. "Atomic" here means "synchronous within one Node event-loop turn" —
 *     genuinely safe for this in-process Map, but a real concurrent-safe
 *     guarantee needs a DB-level unique constraint or transaction, which
 *     PrismaBookingRepository would implement instead of this check.
 *
 * Survives Next.js dev-mode hot-reload via a globalThis singleton, the same
 * pattern used for a Prisma client singleton.
 */
class InMemoryBookingStore {
  bookings = new Map<string, Booking>();
  byToken = new Map<string, string>(); // token -> booking id
}

function getStore(): InMemoryBookingStore {
  const g = globalThis as unknown as { __bookingStore?: InMemoryBookingStore };
  if (!g.__bookingStore) g.__bookingStore = new InMemoryBookingStore();
  return g.__bookingStore;
}

export class InMemoryBookingRepository implements BookingRepository {
  private get store() {
    return getStore();
  }

  async createIfSlotFree(booking: Booking): Promise<boolean> {
    const conflict = [...this.store.bookings.values()].some(
      (b) => b.status === "confirmed" && b.solicitorSlug === booking.solicitorSlug && slotsOverlap(b.slot, booking.slot),
    );
    if (conflict) return false;

    this.store.bookings.set(booking.id, booking);
    this.store.byToken.set(booking.manageToken, booking.id);
    return true;
  }

  async findByToken(token: string): Promise<Booking | undefined> {
    const id = this.store.byToken.get(token);
    return id ? this.store.bookings.get(id) : undefined;
  }

  async findById(id: string): Promise<Booking | undefined> {
    return this.store.bookings.get(id);
  }

  async findConfirmedSlotsForSolicitor(solicitorSlug: string): Promise<TimeSlot[]> {
    return [...this.store.bookings.values()]
      .filter((b) => b.status === "confirmed" && b.solicitorSlug === solicitorSlug)
      .map((b) => b.slot);
  }

  async save(booking: Booking): Promise<void> {
    this.store.bookings.set(booking.id, booking);
  }

  async rescheduleIfSlotFree(bookingId: string, newSlot: TimeSlot): Promise<boolean> {
    const booking = this.store.bookings.get(bookingId);
    if (!booking) return false;

    const conflict = [...this.store.bookings.values()].some(
      (b) =>
        b.id !== bookingId &&
        b.status === "confirmed" &&
        b.solicitorSlug === booking.solicitorSlug &&
        slotsOverlap(b.slot, newSlot),
    );
    if (conflict) return false;

    booking.rescheduledFrom = booking.slot;
    booking.slot = newSlot;
    this.store.bookings.set(bookingId, booking);
    return true;
  }

  async findDueForReminder(withinHours: number, now: Date): Promise<Booking[]> {
    const cutoff = now.getTime() + withinHours * 3_600_000;
    return [...this.store.bookings.values()].filter(
      (b) =>
        b.status === "confirmed" &&
        !b.reminderSentAt &&
        Date.parse(b.slot.startUtc) > now.getTime() &&
        Date.parse(b.slot.startUtc) <= cutoff,
    );
  }
}
