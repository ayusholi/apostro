"use client";

import { formatInTimeZone, timeZoneAbbreviation } from "@/domain/scheduling/timezone";
import { StateBanner } from "@/components/ui/StateBanner";
import type { BookableService, Office, Solicitor } from "@/application/booking/ports";
import type { ClientDetails } from "@/hooks/useBookingWizard";

export function ReviewStep({
  service,
  solicitor,
  office,
  slotStartUtc,
  displayTimeZone,
  client,
  submitStatus,
  submitError,
  onConfirm,
}: {
  service: BookableService;
  solicitor: Solicitor;
  office: Office;
  slotStartUtc: string;
  displayTimeZone: string;
  client: ClientDetails;
  submitStatus: "idle" | "loading" | "error" | "success";
  submitError: string | null;
  onConfirm: () => void;
}) {
  return (
    <div>
      <span className="eyebrow" style={{ marginBottom: 20, display: "inline-flex" }}>
        Review &amp; confirm
      </span>
      <div className="booking-summary">
        <div className="booking-summary__row">
          <span className="booking-summary__label">Service</span>
          <span className="booking-summary__value">{service.title}</span>
        </div>
        <div className="booking-summary__row">
          <span className="booking-summary__label">Solicitor</span>
          <span className="booking-summary__value">{solicitor.name}</span>
        </div>
        <div className="booking-summary__row">
          <span className="booking-summary__label">Office</span>
          <span className="booking-summary__value">
            {office.name}, {office.address}
          </span>
        </div>
        <div className="booking-summary__row">
          <span className="booking-summary__label">When</span>
          <span className="booking-summary__value">
            {formatInTimeZone(slotStartUtc, displayTimeZone, {
              weekday: "long",
              month: "long",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}{" "}
            ({timeZoneAbbreviation(slotStartUtc, displayTimeZone)})
          </span>
        </div>
        <div className="booking-summary__row">
          <span className="booking-summary__label">Contact</span>
          <span className="booking-summary__value">
            {client.name} · {client.email} · {client.phone}
          </span>
        </div>
        {client.notes && (
          <div className="booking-summary__row">
            <span className="booking-summary__label">Notes</span>
            <span className="booking-summary__value">{client.notes}</span>
          </div>
        )}
      </div>

      {submitStatus === "error" && (
        <StateBanner variant="error" title="We couldn't complete your booking">
          {submitError}
        </StateBanner>
      )}

      <div className="wizard-actions" style={{ justifyContent: "flex-start", marginTop: submitStatus === "error" ? 20 : 0 }}>
        <button type="button" className="btn btn--gold" onClick={onConfirm} disabled={submitStatus === "loading"}>
          {submitStatus === "loading" ? "Confirming…" : "Confirm booking"} <span className="arrow">↗</span>
        </button>
      </div>
    </div>
  );
}
