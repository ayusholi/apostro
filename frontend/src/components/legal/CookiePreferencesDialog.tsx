"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { ConsentChoice } from "@/lib/cookies/consent";

/**
 * Native <dialog> for the same reason VideoTestimonials.tsx uses one:
 * Escape-to-close, focus trapping, and a ::backdrop all come free. Nothing
 * is pre-ticked unless `initial` says otherwise — a fresh visitor always
 * starts from "off", per UK GDPR/PECR's no-pre-consent rule.
 */
export function CookiePreferencesDialog({
  initial,
  onClose,
  onSave,
}: {
  initial?: ConsentChoice;
  onClose: () => void;
  onSave: (choice: ConsentChoice) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [analytics, setAnalytics] = useState(initial?.analytics ?? false);
  const [marketing, setMarketing] = useState(initial?.marketing ?? false);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="cookie-dialog"
      aria-label="Manage cookie preferences"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) dialogRef.current?.close();
      }}
    >
      <div className="cookie-dialog__inner">
        <h2>Manage Cookie Preferences</h2>
        <p className="cookie-dialog__intro">
          Choose which optional cookies we can use. You can change this at any time, see our{" "}
          <Link href="/legal/cookie-policy">Cookie Policy</Link> for what each category actually covers today.
        </p>

        <div className="cookie-dialog__row">
          <div>
            <strong>Strictly necessary</strong>
            <p>Required to run the site, for example, remembering this choice. Always on.</p>
          </div>
          <input type="checkbox" checked disabled aria-label="Strictly necessary cookies, always enabled" />
        </div>

        <label className="cookie-dialog__row" htmlFor="consent-analytics">
          <div>
            <strong>Analytics</strong>
            <p>Not currently in use, reserved for future site-usage analytics.</p>
          </div>
          <input
            type="checkbox"
            id="consent-analytics"
            checked={analytics}
            onChange={(e) => setAnalytics(e.target.checked)}
          />
        </label>

        <label className="cookie-dialog__row" htmlFor="consent-marketing">
          <div>
            <strong>Marketing</strong>
            <p>Not currently in use, reserved for future advertising or remarketing.</p>
          </div>
          <input
            type="checkbox"
            id="consent-marketing"
            checked={marketing}
            onChange={(e) => setMarketing(e.target.checked)}
          />
        </label>

        <div className="cookie-dialog__actions">
          <button type="button" className="btn btn--ghost" onClick={() => dialogRef.current?.close()}>
            Cancel
          </button>
          <button type="button" className="btn btn--gold" onClick={() => onSave({ analytics, marketing })}>
            Save Preferences
          </button>
        </div>
      </div>
    </dialog>
  );
}
