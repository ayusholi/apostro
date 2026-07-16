"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  CONSENT_STORAGE_KEY,
  parseStoredConsent,
  type ConsentChoice,
} from "@/lib/cookies/consent";

// Fired after a same-tab write, since the native "storage" event only fires
// in OTHER tabs — without this, accepting/declining wouldn't hide the banner
// in the tab you clicked in until a manual refresh.
const LOCAL_CHANGE_EVENT = "cookie-consent-changed";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(LOCAL_CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(LOCAL_CHANGE_EVENT, callback);
  };
}

function getSnapshot(): string | null {
  return localStorage.getItem(CONSENT_STORAGE_KEY);
}

// The server can't know a returning visitor's stored choice, so it always
// renders as "not yet decided" — the client's first real read (above)
// corrects this via useSyncExternalStore's built-in re-render, the same
// hydration-safe pattern useDetectedTimeZone uses for the browser timezone.
function getServerSnapshot(): string | null {
  return null;
}

/** `consent === null` means "not yet decided" — show the banner. */
export function useCookieConsent(): { consent: ConsentChoice | null; setConsent: (choice: ConsentChoice) => void } {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setConsent = useCallback((choice: ConsentChoice) => {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(choice));
    window.dispatchEvent(new Event(LOCAL_CHANGE_EVENT));
  }, []);

  return { consent: parseStoredConsent(raw), setConsent };
}
