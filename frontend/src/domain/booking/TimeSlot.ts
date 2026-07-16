/**
 * A time slot is always stored/compared in UTC. Display in any timezone is a
 * pure formatting concern (see domain/scheduling/timezone.ts) — never store a
 * "local" time, or DST makes it silently wrong twice a year.
 */
export type TimeSlot = {
  /** ISO 8601 UTC instant, e.g. "2026-08-04T13:30:00.000Z". */
  startUtc: string;
  endUtc: string;
};

export function slotsOverlap(a: TimeSlot, b: TimeSlot): boolean {
  return Date.parse(a.startUtc) < Date.parse(b.endUtc) && Date.parse(b.startUtc) < Date.parse(a.endUtc);
}

export function makeSlot(startUtcMs: number, durationMinutes: number): TimeSlot {
  return {
    startUtc: new Date(startUtcMs).toISOString(),
    endUtc: new Date(startUtcMs + durationMinutes * 60_000).toISOString(),
  };
}
