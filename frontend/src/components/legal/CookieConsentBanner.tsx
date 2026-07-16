"use client";

import { useState } from "react";
import Link from "next/link";
import { useCookieConsent } from "@/hooks/useCookieConsent";
import { ACCEPT_ALL, DECLINE_ALL } from "@/lib/cookies/consent";
import { CookiePreferencesDialog } from "@/components/legal/CookiePreferencesDialog";

/**
 * Mounted once in the root layout. Renders nothing once a choice is stored —
 * @see useCookieConsent for why that's safe to check on first client render
 * without a hydration mismatch.
 */
export function CookieConsentBanner() {
  const { consent, setConsent } = useCookieConsent();
  const [showPreferences, setShowPreferences] = useState(false);

  if (consent !== null) return null;

  return (
    <aside className="cookie-banner" role="region" aria-label="Cookie consent">
      <p>
        We use strictly necessary cookies to run this site, and — only with your consent — analytics cookies to
        understand how it&apos;s used. See our <Link href="/legal/cookie-policy">Cookie Policy</Link>.
      </p>
      <div className="cookie-banner__actions">
        <button type="button" className="btn btn--ghost" onClick={() => setShowPreferences(true)}>
          Manage Preferences
        </button>
        <button type="button" className="btn btn--ghost" onClick={() => setConsent(DECLINE_ALL)}>
          Necessary Only
        </button>
        <button type="button" className="btn btn--gold" onClick={() => setConsent(ACCEPT_ALL)}>
          Accept All
        </button>
      </div>

      {showPreferences && (
        <CookiePreferencesDialog
          onClose={() => setShowPreferences(false)}
          onSave={(choice) => {
            setConsent(choice);
            setShowPreferences(false);
          }}
        />
      )}
    </aside>
  );
}
