"use client";

import { useState } from "react";
import { useCookieConsent } from "@/hooks/useCookieConsent";
import { CookiePreferencesDialog } from "@/components/legal/CookiePreferencesDialog";

/** Footer link so a visitor can change their cookie choice long after the initial banner is gone. */
export function CookiePreferencesLink() {
  const { consent, setConsent } = useCookieConsent();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className="footer__link-button" onClick={() => setOpen(true)}>
        Cookie Preferences
      </button>
      {open && (
        <CookiePreferencesDialog
          initial={consent ?? undefined}
          onClose={() => setOpen(false)}
          onSave={(choice) => {
            setConsent(choice);
            setOpen(false);
          }}
        />
      )}
    </>
  );
}
