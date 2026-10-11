import type { Booking } from "@/domain/booking/Booking";
import type { TimeSlot } from "@/domain/booking/TimeSlot";
import { buildGoogleCalendarLink, buildOutlookCalendarLink } from "@/domain/scheduling/calendarLinks";
import { buildIcsEvent } from "@/domain/scheduling/ics";
import { formatInTimeZone, timeZoneAbbreviation } from "@/domain/scheduling/timezone";
import { siteConfig } from "@/config/site";
import type { BookableService, EmailMessage, Office, Solicitor } from "./ports";

export type BookingEmailContext = {
  booking: Booking;
  service: BookableService;
  solicitor: Solicitor;
  office: Office;
};

function whenLine(slot: TimeSlot, timeZone: string): string {
  const formatted = formatInTimeZone(slot.startUtc, timeZone, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  return `${formatted} (${timeZoneAbbreviation(slot.startUtc, timeZone)})`;
}

function icsAttachment(ctx: BookingEmailContext, status: "CONFIRMED" | "CANCELLED", sequence: number) {
  const content = buildIcsEvent(
    {
      uid: `${ctx.booking.id}@alls-legal.co.uk`,
      startUtc: ctx.booking.slot.startUtc,
      endUtc: ctx.booking.slot.endUtc,
      summary: `${ctx.service.title} consultation | ${siteConfig.name}`,
      description: `Consultation with ${ctx.solicitor.name} at ${ctx.office.name}. Manage this booking: ${manageUrl(ctx.booking.manageToken)}`,
      location: ctx.office.address,
      sequence,
      status,
    },
    siteConfig.email,
  );
  return { filename: "appointment.ics", content, contentType: "text/calendar; charset=utf-8; method=PUBLISH" };
}

function manageUrl(token: string): string {
  return `${siteConfig.url}/booking/manage/${token}`;
}

function shell(title: string, bodyHtml: string): string {
  return `<!doctype html>
<html lang="en-GB"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /><title>${title}</title></head>
<body style="margin:0;background:#f4f0e7;font-family:Georgia,'Times New Roman',serif;color:#211f1a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px;">
    <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border:1px solid #e2dccd;border-radius:10px;overflow:hidden;">
      <tr><td style="background:#0c0c0c;padding:22px 28px;">
        <span style="font-family:Georgia,serif;letter-spacing:.14em;color:#ffffff;font-size:18px;">${siteConfig.name.toUpperCase()}</span>
        <span style="display:block;font-family:Arial,sans-serif;letter-spacing:.2em;color:#c89b53;font-size:10px;margin-top:2px;text-transform:uppercase;">${siteConfig.tagline}</span>
      </tr></td>
      <tr><td style="padding:28px;">
        ${bodyHtml}
      </td></tr>
      <tr><td style="padding:18px 28px;border-top:1px solid #e2dccd;font-family:Arial,sans-serif;font-size:12px;color:#7c7768;">
        ${siteConfig.name} · ${siteConfig.address} · <a href="${siteConfig.phoneHref}" style="color:#97701f;">${siteConfig.phone}</a>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}

function detailRows(ctx: BookingEmailContext): string {
  const row = (label: string, value: string) =>
    `<tr><td style="padding:4px 0;font-family:Arial,sans-serif;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#7c7768;width:110px;vertical-align:top;">${label}</td><td style="padding:4px 0;font-family:Arial,sans-serif;font-size:14px;color:#211f1a;">${value}</td></tr>`;
  return `<table role="presentation" width="100%" style="margin:18px 0;">
    ${row("When", whenLine(ctx.booking.slot, ctx.booking.displayTimeZone))}
    ${row("Service", ctx.service.title)}
    ${row("Solicitor", ctx.solicitor.name)}
    ${row("Office", `${ctx.office.name}, ${ctx.office.address}`)}
  </table>`;
}

function ctaButton(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:#97701f;color:#ffffff;font-family:Arial,sans-serif;font-size:13px;font-weight:bold;text-decoration:none;padding:11px 20px;border-radius:999px;margin:4px 8px 4px 0;">${label}</a>`;
}

export function composeConfirmationEmail(ctx: BookingEmailContext): EmailMessage {
  const google = buildGoogleCalendarLink({
    title: `${ctx.service.title} consultation | ${siteConfig.name}`,
    details: `Consultation with ${ctx.solicitor.name}.`,
    location: ctx.office.address,
    startUtc: ctx.booking.slot.startUtc,
    endUtc: ctx.booking.slot.endUtc,
  });
  const outlook = buildOutlookCalendarLink({
    title: `${ctx.service.title} consultation | ${siteConfig.name}`,
    details: `Consultation with ${ctx.solicitor.name}.`,
    location: ctx.office.address,
    startUtc: ctx.booking.slot.startUtc,
    endUtc: ctx.booking.slot.endUtc,
  });
  const html = shell(
    "Booking confirmed",
    `<h1 style="font-size:22px;margin:0 0 6px;">Your consultation is confirmed</h1>
     <p style="font-family:Arial,sans-serif;font-size:14px;color:#4d4a41;margin:0 0 4px;">Hi ${ctx.booking.client.name}, thanks for booking with ${siteConfig.name}.</p>
     ${detailRows(ctx)}
     <div>${ctaButton(google, "Add to Google Calendar")}${ctaButton(outlook, "Add to Outlook")}</div>
     <p style="font-family:Arial,sans-serif;font-size:13px;color:#7c7768;margin-top:20px;">A calendar file is attached to this email for Apple Calendar and other apps.</p>
     <p style="font-family:Arial,sans-serif;font-size:13px;margin-top:16px;">Need to change plans? <a href="${manageUrl(ctx.booking.manageToken)}" style="color:#97701f;">Manage or cancel your booking</a>.</p>`,
  );
  return {
    to: ctx.booking.client.email,
    subject: `Confirmed: ${ctx.service.title} consultation with ${ctx.solicitor.name}`,
    html,
    text: `Your consultation is confirmed.\n\nWhen: ${whenLine(ctx.booking.slot, ctx.booking.displayTimeZone)}\nService: ${ctx.service.title}\nSolicitor: ${ctx.solicitor.name}\nOffice: ${ctx.office.name}, ${ctx.office.address}\n\nManage or cancel: ${manageUrl(ctx.booking.manageToken)}\nAdd to Google Calendar: ${google}\nAdd to Outlook: ${outlook}`,
    attachments: [icsAttachment(ctx, "CONFIRMED", 0)],
  };
}

export function composeReminderEmail(ctx: BookingEmailContext): EmailMessage {
  const html = shell(
    "Appointment reminder",
    `<h1 style="font-size:22px;margin:0 0 6px;">Reminder: your consultation is coming up</h1>
     <p style="font-family:Arial,sans-serif;font-size:14px;color:#4d4a41;margin:0 0 4px;">Hi ${ctx.booking.client.name}, this is a reminder of your upcoming appointment.</p>
     ${detailRows(ctx)}
     <p style="font-family:Arial,sans-serif;font-size:13px;margin-top:16px;">Need to change plans? <a href="${manageUrl(ctx.booking.manageToken)}" style="color:#97701f;">Manage or cancel your booking</a>.</p>`,
  );
  return {
    to: ctx.booking.client.email,
    subject: `Reminder: ${ctx.service.title} consultation tomorrow`,
    html,
    text: `Reminder: your consultation is coming up.\n\nWhen: ${whenLine(ctx.booking.slot, ctx.booking.displayTimeZone)}\nService: ${ctx.service.title}\nSolicitor: ${ctx.solicitor.name}\nOffice: ${ctx.office.name}, ${ctx.office.address}\n\nManage or cancel: ${manageUrl(ctx.booking.manageToken)}`,
    attachments: [icsAttachment(ctx, "CONFIRMED", 0)],
  };
}

export function composeCancellationEmail(ctx: BookingEmailContext): EmailMessage {
  const html = shell(
    "Booking cancelled",
    `<h1 style="font-size:22px;margin:0 0 6px;">Your consultation has been cancelled</h1>
     <p style="font-family:Arial,sans-serif;font-size:14px;color:#4d4a41;margin:0 0 4px;">Hi ${ctx.booking.client.name}, the appointment below has been cancelled as requested.</p>
     ${detailRows(ctx)}
     <p style="font-family:Arial,sans-serif;font-size:13px;margin-top:16px;">Changed your mind? <a href="${siteConfig.url}/book" style="color:#97701f;">Book a new consultation</a>.</p>`,
  );
  return {
    to: ctx.booking.client.email,
    subject: `Cancelled: ${ctx.service.title} consultation`,
    html,
    text: `Your consultation has been cancelled.\n\nWas: ${whenLine(ctx.booking.slot, ctx.booking.displayTimeZone)} with ${ctx.solicitor.name}\n\nBook again: ${siteConfig.url}/book`,
    attachments: [icsAttachment(ctx, "CANCELLED", 1)],
  };
}

export function composeRescheduleEmail(ctx: BookingEmailContext, previousSlot: TimeSlot): EmailMessage {
  const google = buildGoogleCalendarLink({
    title: `${ctx.service.title} consultation | ${siteConfig.name}`,
    details: `Consultation with ${ctx.solicitor.name}.`,
    location: ctx.office.address,
    startUtc: ctx.booking.slot.startUtc,
    endUtc: ctx.booking.slot.endUtc,
  });
  const html = shell(
    "Booking rescheduled",
    `<h1 style="font-size:22px;margin:0 0 6px;">Your consultation has been rescheduled</h1>
     <p style="font-family:Arial,sans-serif;font-size:14px;color:#4d4a41;margin:0 0 4px;">Hi ${ctx.booking.client.name}, your new appointment time is confirmed below.</p>
     <p style="font-family:Arial,sans-serif;font-size:13px;color:#a5402e;text-decoration:line-through;margin:12px 0 0;">Previously: ${whenLine(previousSlot, ctx.booking.displayTimeZone)}</p>
     ${detailRows(ctx)}
     <div>${ctaButton(google, "Update Google Calendar")}</div>
     <p style="font-family:Arial,sans-serif;font-size:13px;margin-top:16px;">Need to change again? <a href="${manageUrl(ctx.booking.manageToken)}" style="color:#97701f;">Manage your booking</a>.</p>`,
  );
  return {
    to: ctx.booking.client.email,
    subject: `Rescheduled: ${ctx.service.title} consultation with ${ctx.solicitor.name}`,
    html,
    text: `Your consultation has been rescheduled.\n\nNew time: ${whenLine(ctx.booking.slot, ctx.booking.displayTimeZone)}\nPreviously: ${whenLine(previousSlot, ctx.booking.displayTimeZone)}\n\nManage: ${manageUrl(ctx.booking.manageToken)}`,
    attachments: [icsAttachment(ctx, "CONFIRMED", 1)],
  };
}

function adminEmail(subject: string, bodyLines: string[], ctx: BookingEmailContext): EmailMessage {
  const html = shell(
    subject,
    `<h1 style="font-size:20px;margin:0 0 12px;">${subject}</h1>
     ${detailRows(ctx)}
     <table role="presentation" width="100%" style="margin-top:14px;">
       <tr><td style="padding:4px 0;font-family:Arial,sans-serif;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#7c7768;width:110px;">Client</td>
           <td style="padding:4px 0;font-family:Arial,sans-serif;font-size:14px;">${ctx.booking.client.name} · ${ctx.booking.client.email} · ${ctx.booking.client.phone}</td></tr>
       ${ctx.booking.client.notes ? `<tr><td style="padding:4px 0;font-family:Arial,sans-serif;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#7c7768;">Notes</td><td style="padding:4px 0;font-family:Arial,sans-serif;font-size:14px;">${ctx.booking.client.notes}</td></tr>` : ""}
     </table>`,
  );
  return {
    to: siteConfig.email,
    subject: `[Booking] ${subject}: ${ctx.booking.client.name}`,
    html,
    text: [subject, ...bodyLines].join("\n"),
  };
}

export function composeAdminNewBookingEmail(ctx: BookingEmailContext): EmailMessage {
  return adminEmail(
    "New consultation booked",
    [`When: ${whenLine(ctx.booking.slot, ctx.booking.displayTimeZone)}`, `Solicitor: ${ctx.solicitor.name}`],
    ctx,
  );
}

export function composeAdminCancellationEmail(ctx: BookingEmailContext): EmailMessage {
  return adminEmail(
    "Consultation cancelled",
    [`Was: ${whenLine(ctx.booking.slot, ctx.booking.displayTimeZone)}`, `Solicitor: ${ctx.solicitor.name}`],
    ctx,
  );
}

export function composeAdminRescheduleEmail(ctx: BookingEmailContext, previousSlot: TimeSlot): EmailMessage {
  return adminEmail(
    "Consultation rescheduled",
    [
      `New time: ${whenLine(ctx.booking.slot, ctx.booking.displayTimeZone)}`,
      `Previously: ${whenLine(previousSlot, ctx.booking.displayTimeZone)}`,
      `Solicitor: ${ctx.solicitor.name}`,
    ],
    ctx,
  );
}
