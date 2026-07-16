"use client";

import { useState } from "react";
import Link from "next/link";
import { createBookingSchema, zodFieldErrors } from "@/application/booking/validation";
import type { ClientDetails } from "@/hooks/useBookingWizard";

export function DetailsStep({
  client,
  onChange,
  honeypot,
  onHoneypotChange,
  onContinue,
}: {
  client: ClientDetails;
  onChange: (patch: Partial<ClientDetails>) => void;
  honeypot: string;
  onHoneypotChange: (value: string) => void;
  onContinue: () => void;
}) {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  function handleContinue() {
    const result = createBookingSchema.shape.client.safeParse(client);
    if (!result.success) {
      setFieldErrors(zodFieldErrors(result.error));
      return;
    }
    setFieldErrors({});
    onContinue();
  }

  const error = (field: string) => fieldErrors[field]?.[0];

  return (
    <div>
      <span className="eyebrow" style={{ marginBottom: 20, display: "inline-flex" }}>
        Your details
      </span>
      <form
        className="form"
        style={{ maxWidth: 480 }}
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          handleContinue();
        }}
      >
        {/* Honeypot: real users never see this field; any value submitted here is treated as spam server-side. */}
        <div className="hp-field" aria-hidden="true">
          <label htmlFor="company">Company</label>
          <input id="company" name="company" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => onHoneypotChange(e.target.value)} />
        </div>

        <div className="row">
          <div className="field">
            <label htmlFor="db-name">Full name</label>
            <input
              id="db-name"
              value={client.name}
              onChange={(e) => onChange({ name: e.target.value })}
              aria-invalid={!!error("name")}
              aria-describedby={error("name") ? "db-name-error" : undefined}
              autoComplete="name"
            />
            {error("name") && <p id="db-name-error" className="form-status" role="alert">{error("name")}</p>}
          </div>
          <div className="field">
            <label htmlFor="db-phone">Phone</label>
            <input
              id="db-phone"
              type="tel"
              value={client.phone}
              onChange={(e) => onChange({ phone: e.target.value })}
              aria-invalid={!!error("phone")}
              aria-describedby={error("phone") ? "db-phone-error" : undefined}
              autoComplete="tel"
            />
            {error("phone") && <p id="db-phone-error" className="form-status" role="alert">{error("phone")}</p>}
          </div>
        </div>

        <div className="field">
          <label htmlFor="db-email">Email</label>
          <input
            id="db-email"
            type="email"
            value={client.email}
            onChange={(e) => onChange({ email: e.target.value })}
            aria-invalid={!!error("email")}
            aria-describedby={error("email") ? "db-email-error" : undefined}
            autoComplete="email"
          />
          {error("email") && <p id="db-email-error" className="form-status" role="alert">{error("email")}</p>}
        </div>

        <div className="field">
          <label htmlFor="db-notes">What&apos;s this about? (optional)</label>
          <textarea
            id="db-notes"
            value={client.notes}
            onChange={(e) => onChange({ notes: e.target.value })}
            aria-invalid={!!error("notes")}
          />
          {error("notes") && <p className="form-status" role="alert">{error("notes")}</p>}
        </div>

        {/* Booking a consultation is a contractual step, not a marketing
            signup, so no separate consent checkbox is needed here (unlike
            ContactForm.tsx's optional marketing opt-in) — just a clear link
            to how the data's handled. */}
        <p className="form-privacy-note">
          We&apos;ll use these details to manage your booking and send you confirmation/reminder emails. See our{" "}
          <Link href="/legal/privacy-policy">Privacy Policy</Link>.
        </p>

        <button type="submit" className="btn btn--gold">
          Continue to review <span className="arrow">↗</span>
        </button>
      </form>
    </div>
  );
}
