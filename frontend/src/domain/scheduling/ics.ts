/**
 * Minimal RFC 5545 (iCalendar) VEVENT generator — one event per file, which is
 * all a booking confirmation needs. Hand-rolled instead of the `ics` package:
 * a single VEVENT is ~15 lines of well-specified text format, not worth a
 * dependency for.
 */
export type IcsEventInput = {
  uid: string;
  startUtc: string;
  endUtc: string;
  summary: string;
  description: string;
  location: string;
  /** Bumped on reschedule so calendar apps that already imported the original update it, per RFC 5545 SEQUENCE semantics. */
  sequence: number;
  /** "CONFIRMED" | "CANCELLED" — maps to the RFC's STATUS property. */
  status: "CONFIRMED" | "CANCELLED";
};

function toIcsUtc(iso: string): string {
  // "2026-08-04T13:30:00.000Z" -> "20260804T133000Z"
  return iso.replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

/** Escape per RFC 5545 §3.3.11: backslash, comma, semicolon, then newlines. */
function escapeIcsText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;").replace(/\n/g, "\\n");
}

/** Fold lines >75 octets per RFC 5545 §3.1 — most parsers tolerate long lines, but proper folding avoids relying on that. */
function foldLine(line: string): string {
  if (line.length <= 75) return line;
  const parts: string[] = [];
  let rest = line;
  while (rest.length > 75) {
    parts.push(rest.slice(0, 75));
    rest = " " + rest.slice(75);
  }
  parts.push(rest);
  return parts.join("\r\n");
}

export function buildIcsEvent(event: IcsEventInput, organizerEmail: string): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ALLS//Consultation Booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.uid}`,
    `DTSTAMP:${toIcsUtc(new Date().toISOString())}`,
    `DTSTART:${toIcsUtc(event.startUtc)}`,
    `DTEND:${toIcsUtc(event.endUtc)}`,
    `SUMMARY:${escapeIcsText(event.summary)}`,
    `DESCRIPTION:${escapeIcsText(event.description)}`,
    `LOCATION:${escapeIcsText(event.location)}`,
    `ORGANIZER:mailto:${organizerEmail}`,
    `SEQUENCE:${event.sequence}`,
    `STATUS:${event.status}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.map(foldLine).join("\r\n");
}
