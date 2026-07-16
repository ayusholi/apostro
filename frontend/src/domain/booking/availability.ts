import { getLocalYMD, zonedTimeToUtc } from "@/domain/scheduling/timezone";
import { parseHHMM, type WorkingHours } from "@/domain/scheduling/workingHours";
import { makeSlot, slotsOverlap, type TimeSlot } from "./TimeSlot";

export type GenerateSlotsInput = {
  workingHours: WorkingHours;
  officeTimeZone: string;
  /** Already-confirmed bookings for this solicitor, any office — a solicitor can't be in two places at once. */
  existingBookings: TimeSlot[];
  durationMinutes: number;
  now: Date;
  minNoticeHours: number;
  maxAdvanceDays: number;
  slotIntervalMinutes: number;
};

/**
 * Pure function: working hours + existing bookings + policy -> bookable slots.
 * No IO, no framework — fully unit-testable in isolation, and the one place
 * that has to get timezone/DST arithmetic right.
 */
export function generateAvailableSlots(input: GenerateSlotsInput): TimeSlot[] {
  const {
    workingHours,
    officeTimeZone,
    existingBookings,
    durationMinutes,
    now,
    minNoticeHours,
    maxAdvanceDays,
    slotIntervalMinutes,
  } = input;

  const earliestStartMs = now.getTime() + minNoticeHours * 3_600_000;
  const rangeEnd = new Date(now.getTime() + maxAdvanceDays * 86_400_000);

  const startYMD = getLocalYMD(now, officeTimeZone);
  const endYMD = getLocalYMD(rangeEnd, officeTimeZone);

  const slots: TimeSlot[] = [];

  // Step calendar dates in the office's own timezone — a "day" here means the
  // office's local day, since working hours are defined in office-local time.
  let cursor = Date.UTC(startYMD.year, startYMD.month - 1, startYMD.day);
  const last = Date.UTC(endYMD.year, endYMD.month - 1, endYMD.day);

  while (cursor <= last) {
    const y = new Date(cursor).getUTCFullYear();
    const m = new Date(cursor).getUTCMonth() + 1;
    const d = new Date(cursor).getUTCDate();
    const dow = (new Date(cursor).getUTCDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6);

    const hours = workingHours[dow];
    if (hours) {
      const start = parseHHMM(hours.start);
      const end = parseHHMM(hours.end);
      const dayStartUtc = zonedTimeToUtc(y, m, d, start.hour, start.minute, officeTimeZone);
      const dayEndUtc = zonedTimeToUtc(y, m, d, end.hour, end.minute, officeTimeZone);

      for (
        let candidateMs = dayStartUtc.getTime();
        candidateMs + durationMinutes * 60_000 <= dayEndUtc.getTime();
        candidateMs += slotIntervalMinutes * 60_000
      ) {
        if (candidateMs < earliestStartMs) continue;
        const candidate = makeSlot(candidateMs, durationMinutes);
        const conflicts = existingBookings.some((b) => slotsOverlap(b, candidate));
        if (!conflicts) slots.push(candidate);
      }
    }

    cursor += 86_400_000;
  }

  return slots;
}
