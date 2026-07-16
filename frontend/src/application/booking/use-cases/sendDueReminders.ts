import { BookingPolicy } from "@/domain/booking/policy";
import { composeReminderEmail } from "../emailComposer";
import { resolveBookingContext } from "../resolveContext";
import type {
  BookingRepository,
  Clock,
  NotificationService,
  OfficeRepository,
  ServiceRepository,
  SolicitorRepository,
} from "../ports";

export type SendDueRemindersDeps = {
  bookings: BookingRepository;
  services: ServiceRepository;
  solicitors: SolicitorRepository;
  offices: OfficeRepository;
  notifications: NotificationService;
  clock: Clock;
};

/**
 * Called by the /api/cron/reminders route (external scheduler). Deliberately
 * best-effort per-booking: one bad record shouldn't stop reminders going out
 * to everyone else due today.
 */
export async function sendDueReminders(deps: SendDueRemindersDeps): Promise<{ sent: number; failed: number }> {
  const now = deps.clock.now();
  const due = await deps.bookings.findDueForReminder(BookingPolicy.reminderLeadHours, now);

  let sent = 0;
  let failed = 0;

  for (const booking of due) {
    try {
      const ctx = await resolveBookingContext(deps, {
        serviceSlug: booking.serviceSlug,
        solicitorSlug: booking.solicitorSlug,
        officeId: booking.officeId,
      });
      await deps.notifications.send(composeReminderEmail({ booking, ...ctx }));
      booking.reminderSentAt = now.toISOString();
      await deps.bookings.save(booking);
      sent++;
    } catch (err) {
      console.error("[booking] reminder failed for", booking.id, err);
      failed++;
    }
  }

  return { sent, failed };
}
