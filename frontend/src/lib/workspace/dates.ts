/**
 * Workspace mock data is anchored to "today" so the prototype always looks
 * current. Stamps are plain `YYYY-MM-DDTHH:MM` strings in UK local time and
 * every formatter below works on them with UTC maths, so server and client
 * render the same labels regardless of either machine's timezone.
 */

const DAY = 86_400_000;
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAYS_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Today's date in London as YYYY-MM-DD. */
function londonToday(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London" }).format(new Date());
}

const TODAY = londonToday();
const TODAY_MS = Date.parse(`${TODAY}T00:00:00Z`);

function toDateString(ms: number) {
  return new Date(ms).toISOString().slice(0, 10);
}

/** A stamp `offset` days from today at `time` (HH:MM). */
export function stamp(offset: number, time = "09:00"): string {
  return `${toDateString(TODAY_MS + offset * DAY)}T${time}`;
}

/** A date-only stamp `offset` days from today. */
export function day(offset: number): string {
  return toDateString(TODAY_MS + offset * DAY);
}

export function todayStamp() {
  return TODAY;
}

/** The current London wall-clock time as a stamp (used for new records). */
export function nowStamp(): string {
  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
  return `${TODAY}T${time}`;
}

function dateMs(value: string) {
  return Date.parse(`${value.slice(0, 10)}T00:00:00Z`);
}

/** Whole days between today and the stamp (negative = past). */
export function dayDiff(value: string): number {
  return Math.round((dateMs(value) - TODAY_MS) / DAY);
}

export function timeOf(value: string): string | null {
  return value.length > 10 ? value.slice(11, 16) : null;
}

/** "Today", "Yesterday", "Tomorrow", "Thu 5 Nov", or "5 Nov 2025" outside this year. */
export function formatDay(value: string): string {
  const diff = dayDiff(value);
  if (diff === 0) return "Today";
  if (diff === -1) return "Yesterday";
  if (diff === 1) return "Tomorrow";
  const d = new Date(dateMs(value));
  const sameYear = d.getUTCFullYear() === new Date(TODAY_MS).getUTCFullYear();
  if (Math.abs(diff) < 7) return `${WEEKDAYS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
  return sameYear
    ? `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`
    : `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** "Today, 09:12" or "Fri 30 Oct, 14:05". */
export function formatStamp(value: string): string {
  const time = timeOf(value);
  return time ? `${formatDay(value)}, ${time}` : formatDay(value);
}

/** Compact list timestamp: time for today, day label otherwise. */
export function formatShort(value: string): string {
  const time = timeOf(value);
  return dayDiff(value) === 0 && time ? time : formatDay(value);
}

/** "Monday 2 November" */
export function formatLongDate(value: string = TODAY): string {
  const d = new Date(dateMs(value));
  return `${WEEKDAYS_LONG[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS_LONG[d.getUTCMonth()]}`;
}

/** "2 November 2026" */
export function formatFullDate(value: string): string {
  const d = new Date(dateMs(value));
  return `${d.getUTCDate()} ${MONTHS_LONG[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** Relative due phrasing: "Overdue by 2 days", "Due today", "Due in 3 days". */
export function formatDue(value: string): string {
  const diff = dayDiff(value);
  if (diff < -1) return `Overdue by ${-diff} days`;
  if (diff === -1) return "Overdue by 1 day";
  if (diff === 0) return "Due today";
  if (diff === 1) return "Due tomorrow";
  if (diff < 7) return `Due ${formatDay(value)}`;
  return `Due ${formatDay(value)}`;
}

/** Day-period greeting from London wall-clock hour. */
export function greeting(): string {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", hour: "2-digit", hour12: false }).format(new Date()),
  );
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
