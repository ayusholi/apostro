/**
 * "Add to calendar" web links — no OAuth, no API key, work today for anyone.
 * This is deliberately the depth of "Google/Outlook compatibility" here: a
 * real two-way sync (writing into a user's connected Google Calendar via the
 * Calendar API, or Microsoft Graph for Outlook) needs a registered OAuth app,
 * a client secret, and a consent flow — infrastructure that can't exist
 * without a live, publicly reachable deployment and real credentials. These
 * links cover the common case (client adds the appointment to whichever
 * calendar they use) and are additive to the .ics attachment, not a
 * replacement — Apple Calendar and most desktop clients prefer the .ics.
 */
function toCompactUtc(iso: string): string {
  return iso.replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

export function buildGoogleCalendarLink(input: {
  title: string;
  details: string;
  location: string;
  startUtc: string;
  endUtc: string;
}): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: input.title,
    details: input.details,
    location: input.location,
    dates: `${toCompactUtc(input.startUtc)}/${toCompactUtc(input.endUtc)}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function buildOutlookCalendarLink(input: {
  title: string;
  details: string;
  location: string;
  startUtc: string;
  endUtc: string;
}): string {
  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: input.title,
    body: input.details,
    location: input.location,
    startdt: input.startUtc,
    enddt: input.endUtc,
  });
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}
