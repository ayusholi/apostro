"use client";

import { useEffect, useMemo, useState } from "react";
import { siteConfig } from "@/config/site";
import { cancelBookingAction, getAvailabilityAction, rescheduleBookingAction } from "@/actions/booking";
import type { BookingSummary } from "@/application/booking/dto";
import { buildGoogleCalendarLink, buildOutlookCalendarLink } from "@/domain/scheduling/calendarLinks";
import { buildIcsEvent } from "@/domain/scheduling/ics";
import { formatInTimeZone, timeZoneAbbreviation } from "@/domain/scheduling/timezone";
import { groupSlotsByLocalDate } from "@/hooks/useBookingWizard";
import { Calendar } from "./Calendar";
import { TimeSlotGrid } from "./TimeSlotGrid";
import { TimezoneSelect } from "./TimezoneSelect";
import { StateBanner } from "@/components/ui/StateBanner";

type Mode = "view" | "confirmCancel" | "reschedule";
type AsyncStatus = "idle" | "loading" | "error" | "success";

function summaryRows(summary: BookingSummary) {
  return (
    <div className="booking-summary">
      <div className="booking-summary__row">
        <span className="booking-summary__label">Service</span>
        <span className="booking-summary__value">{summary.serviceTitle}</span>
      </div>
      <div className="booking-summary__row">
        <span className="booking-summary__label">Solicitor</span>
        <span className="booking-summary__value">{summary.solicitorName}</span>
      </div>
      <div className="booking-summary__row">
        <span className="booking-summary__label">Office</span>
        <span className="booking-summary__value">
          {summary.officeName}, {summary.officeAddress}
        </span>
      </div>
      <div className="booking-summary__row">
        <span className="booking-summary__label">When</span>
        <span className="booking-summary__value">
          {formatInTimeZone(summary.slotStartUtc, summary.displayTimeZone, {
            weekday: "long",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}{" "}
          ({timeZoneAbbreviation(summary.slotStartUtc, summary.displayTimeZone)})
        </span>
      </div>
    </div>
  );
}

function downloadIcs(summary: BookingSummary) {
  const content = buildIcsEvent(
    {
      uid: `${summary.id}@alls-legal.co.uk`,
      startUtc: summary.slotStartUtc,
      endUtc: summary.slotEndUtc,
      summary: `${summary.serviceTitle} consultation | ALLS`,
      description: `Consultation with ${summary.solicitorName} at ${summary.officeName}.`,
      location: summary.officeAddress,
      sequence: 0,
      status: "CONFIRMED",
    },
    siteConfig.email,
  );
  const blob = new Blob([content], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "appointment.ics";
  a.click();
  URL.revokeObjectURL(url);
}

export function ManageBookingView({ initial, justConfirmed }: { initial: BookingSummary; justConfirmed: boolean }) {
  const [summary, setSummary] = useState(initial);
  const [mode, setMode] = useState<Mode>("view");
  const [cancelState, setCancelState] = useState<{ status: AsyncStatus; error: string | null }>({
    status: "idle",
    error: null,
  });

  const googleLink = buildGoogleCalendarLink({
    title: `${summary.serviceTitle} consultation | ALLS`,
    details: `Consultation with ${summary.solicitorName}.`,
    location: summary.officeAddress,
    startUtc: summary.slotStartUtc,
    endUtc: summary.slotEndUtc,
  });
  const outlookLink = buildOutlookCalendarLink({
    title: `${summary.serviceTitle} consultation | ALLS`,
    details: `Consultation with ${summary.solicitorName}.`,
    location: summary.officeAddress,
    startUtc: summary.slotStartUtc,
    endUtc: summary.slotEndUtc,
  });

  async function handleCancel() {
    setCancelState({ status: "loading", error: null });
    const result = await cancelBookingAction(summary.manageToken);
    if (result.ok) {
      setSummary(result.data);
      setCancelState({ status: "success", error: null });
      setMode("view");
    } else {
      setCancelState({ status: "error", error: result.error.message });
    }
  }

  if (summary.status === "cancelled") {
    return (
      <div>
        <StateBanner variant="empty" title="This booking has been cancelled">
          Cancelled on {formatInTimeZone(summary.cancelledAt!, summary.displayTimeZone, { dateStyle: "long" } as Intl.DateTimeFormatOptions)}.
        </StateBanner>
        {summaryRows(summary)}
        <a className="btn btn--gold" href="/book">
          Book a new consultation <span className="arrow">↗</span>
        </a>
      </div>
    );
  }

  return (
    <div>
      {justConfirmed && (
        <StateBanner variant="success" title="Your consultation is confirmed">
          A confirmation email is on its way, with a calendar invite attached.
        </StateBanner>
      )}
      {cancelState.status === "error" && (
        <StateBanner variant="error" title="Couldn't cancel booking">
          {cancelState.error}
        </StateBanner>
      )}

      <div style={{ marginTop: justConfirmed || cancelState.status === "error" ? 20 : 0 }}>{summaryRows(summary)}</div>

      <div className="calendar-links">
        <a className="btn btn--ghost-nav btn" href={googleLink} target="_blank" rel="noreferrer">
          Add to Google Calendar
        </a>
        <a className="btn btn--ghost-nav btn" href={outlookLink} target="_blank" rel="noreferrer">
          Add to Outlook
        </a>
        <button type="button" className="btn btn--ghost-nav" onClick={() => downloadIcs(summary)}>
          Download .ics
        </button>
      </div>

      {!summary.canModify && mode === "view" && (
        <StateBanner variant="empty" title="This appointment can no longer be changed online">
          It&apos;s within 24 hours of the appointment (or already passed). Please call the office directly for any
          changes.
        </StateBanner>
      )}

      {summary.canModify && mode === "view" && (
        <div className="manage-actions">
          <button type="button" className="btn btn--gold" onClick={() => setMode("reschedule")}>
            Reschedule
          </button>
          <button type="button" className="btn btn--ghost-nav btn" onClick={() => setMode("confirmCancel")}>
            Cancel booking
          </button>
        </div>
      )}

      {mode === "confirmCancel" && (
        <div className="manage-actions" style={{ flexDirection: "column", alignItems: "flex-start" }}>
          <p style={{ color: "var(--text)", margin: 0 }}>Are you sure you want to cancel this consultation?</p>
          <div className="manage-actions">
            <button type="button" className="btn btn--gold" onClick={handleCancel} disabled={cancelState.status === "loading"}>
              {cancelState.status === "loading" ? "Cancelling…" : "Yes, cancel it"}
            </button>
            <button type="button" className="btn btn--ghost-nav btn" onClick={() => setMode("view")}>
              Never mind
            </button>
          </div>
        </div>
      )}

      {mode === "reschedule" && (
        <RescheduleView
          summary={summary}
          onCancel={() => setMode("view")}
          onRescheduled={(updated) => {
            setSummary(updated);
            setMode("view");
          }}
        />
      )}
    </div>
  );
}

function RescheduleView({
  summary,
  onCancel,
  onRescheduled,
}: {
  summary: BookingSummary;
  onCancel: () => void;
  onRescheduled: (updated: BookingSummary) => void;
}) {
  const [displayTimeZone, setDisplayTimeZone] = useState(summary.displayTimeZone);
  // Initialized as "loading" directly (rather than set inside the effect
  // below) since this component only ever mounts when it's about to fetch —
  // the parent conditionally renders it fresh each time reschedule mode is
  // entered. That keeps the effect's only setState calls inside its .then().
  const [availability, setAvailability] = useState<{ status: AsyncStatus; slots: string[]; error: string | null }>({
    status: "loading",
    slots: [],
    error: null,
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [submitState, setSubmitState] = useState<{ status: AsyncStatus; error: string | null }>({
    status: "idle",
    error: null,
  });

  useEffect(() => {
    let ignore = false;
    getAvailabilityAction({
      serviceSlug: summary.serviceSlug,
      solicitorSlug: summary.solicitorSlug,
      officeId: summary.officeId,
    }).then((result) => {
      if (ignore) return;
      if (result.ok) setAvailability({ status: "success", slots: result.data.slots, error: null });
      else setAvailability({ status: "error", slots: [], error: result.error.message });
    });
    return () => {
      ignore = true;
    };
    // Fetch once when entering reschedule mode for this booking.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summary.manageToken]);

  const grouped = useMemo(() => groupSlotsByLocalDate(availability.slots, displayTimeZone), [availability.slots, displayTimeZone]);
  const dateKeys = useMemo(() => [...grouped.keys()].sort(), [grouped]);

  async function handleConfirm() {
    if (!selectedSlot) return;
    setSubmitState({ status: "loading", error: null });
    const result = await rescheduleBookingAction({ token: summary.manageToken, newSlotStartUtc: selectedSlot });
    if (result.ok) onRescheduled(result.data);
    else setSubmitState({ status: "error", error: result.error.message });
  }

  return (
    <div style={{ marginTop: 20 }}>
      <span className="eyebrow" style={{ marginBottom: 16, display: "inline-flex" }}>
        Choose a new time
      </span>

      {submitState.status === "error" && (
        <StateBanner variant="error" title="Couldn't reschedule">
          {submitState.error}
        </StateBanner>
      )}

      {availability.status === "loading" || availability.status === "idle" ? (
        <StateBanner variant="loading" title="Checking availability…" />
      ) : availability.status === "error" ? (
        <StateBanner variant="error" title="Couldn't load availability">
          {availability.error}
        </StateBanner>
      ) : dateKeys.length === 0 ? (
        <StateBanner variant="empty" title="No other availability right now">
          Please call the office to find another time.
        </StateBanner>
      ) : (
        <>
          <div style={{ maxWidth: 220, marginBottom: 24 }}>
            <TimezoneSelect value={displayTimeZone} onChange={setDisplayTimeZone} />
          </div>
          <div className="datetime-layout">
            <Calendar
              selectedDate={selectedDate}
              onSelect={(d) => {
                setSelectedDate(d);
                setSelectedSlot(null);
              }}
              availableDates={new Set(dateKeys)}
              minDate={dateKeys[0]}
              maxDate={dateKeys[dateKeys.length - 1]}
            />
            <div className="datetime-layout__slots">
              <h4>{selectedDate ? "Available times" : "Pick a date to see times"}</h4>
              {selectedDate && (
                <TimeSlotGrid
                  slots={grouped.get(selectedDate) ?? []}
                  selected={selectedSlot}
                  onSelect={setSelectedSlot}
                  displayTimeZone={displayTimeZone}
                />
              )}
            </div>
          </div>
        </>
      )}

      <div className="manage-actions">
        {selectedSlot && (
          <button type="button" className="btn btn--gold" onClick={handleConfirm} disabled={submitState.status === "loading"}>
            {submitState.status === "loading" ? "Rescheduling…" : "Confirm new time"}
          </button>
        )}
        <button type="button" className="btn btn--ghost-nav btn" onClick={onCancel}>
          Never mind
        </button>
      </div>
    </div>
  );
}
