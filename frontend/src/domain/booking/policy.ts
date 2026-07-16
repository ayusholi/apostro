/**
 * Business rules as data, not scattered magic numbers. Centralizing these
 * means a future "24h notice" -> "48h notice" change is a one-line edit here,
 * not a hunt through use cases and components.
 */
export const BookingPolicy = {
  /** Earliest a slot can start, relative to now. */
  minNoticeHours: 24,
  /** Furthest out a client can book. */
  maxAdvanceDays: 60,
  /** How close to the appointment cancellation/reschedule is still allowed. */
  cancellationWindowHours: 24,
  /** Grid step when generating candidate slots within working hours. */
  slotIntervalMinutes: 30,
  /** Reminder email sent this many hours before the appointment. */
  reminderLeadHours: 24,
} as const;
