/**
 * Timezone arithmetic using only native `Intl` — no date-fns-tz/luxon/moment.
 * Two operations only: convert a wall-clock time in a given IANA zone to a
 * UTC instant (needed once, to turn "office opens 09:00 Europe/London" into
 * an actual Date), and format a UTC instant back into any zone for display.
 * Everything else (the slot grid, stored bookings) stays in UTC.
 */

/** Minutes to ADD to a UTC instant to get local wall-clock time in `timeZone`, at that instant (handles DST correctly because it's derived from the actual date). */
function getTimeZoneOffsetMinutes(utcInstant: Date, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = Object.fromEntries(dtf.formatToParts(utcInstant).map((p) => [p.type, p.value]));
  const asIfUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );
  return (asIfUtc - utcInstant.getTime()) / 60_000;
}

/** e.g. zonedTimeToUtc(2026, 8, 4, 9, 0, "Europe/London") -> the Date for 09:00 London time on that day, whether BST or GMT applies. */
export function zonedTimeToUtc(
  year: number,
  month1to12: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string,
): Date {
  const guessUtcMs = Date.UTC(year, month1to12 - 1, day, hour, minute, 0);
  const offsetMinutes = getTimeZoneOffsetMinutes(new Date(guessUtcMs), timeZone);
  return new Date(guessUtcMs - offsetMinutes * 60_000);
}

export function formatInTimeZone(
  utcIso: string,
  timeZone: string,
  options: Intl.DateTimeFormatOptions = { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" },
): string {
  return new Intl.DateTimeFormat("en-GB", { ...options, timeZone }).format(new Date(utcIso));
}

export function timeZoneAbbreviation(utcIso: string, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "short" }).formatToParts(new Date(utcIso));
  return parts.find((p) => p.type === "timeZoneName")?.value ?? timeZone;
}

/** Curated, not exhaustive — the zones a UK firm's clients realistically book from. Each select also offers "Detect automatically". */
export const COMMON_TIMEZONES: { value: string; label: string }[] = [
  { value: "Europe/London", label: "London (GMT/BST)" },
  { value: "Europe/Dublin", label: "Dublin" },
  { value: "Europe/Paris", label: "Paris, Berlin, Madrid" },
  { value: "America/New_York", label: "New York (Eastern)" },
  { value: "America/Chicago", label: "Chicago (Central)" },
  { value: "America/Denver", label: "Denver (Mountain)" },
  { value: "America/Los_Angeles", label: "Los Angeles (Pacific)" },
  { value: "America/Toronto", label: "Toronto" },
  { value: "Asia/Dubai", label: "Dubai" },
  { value: "Asia/Kolkata", label: "Mumbai, Delhi" },
  { value: "Asia/Singapore", label: "Singapore" },
  { value: "Asia/Hong_Kong", label: "Hong Kong" },
  { value: "Asia/Tokyo", label: "Tokyo" },
  { value: "Australia/Sydney", label: "Sydney" },
  { value: "Pacific/Auckland", label: "Auckland" },
  { value: "UTC", label: "UTC" },
];

/** The calendar date (y/m/d) that `utcInstant` falls on when viewed in `timeZone`. */
export function getLocalYMD(utcInstant: Date, timeZone: string): { year: number; month: number; day: number } {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" })
      .formatToParts(utcInstant)
      .map((p) => [p.type, p.value]),
  );
  return { year: Number(parts.year), month: Number(parts.month), day: Number(parts.day) };
}

export function isKnownTimeZone(tz: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}
