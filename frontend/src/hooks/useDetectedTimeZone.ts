"use client";

import { useSyncExternalStore } from "react";

// The browser's timezone doesn't change while a tab is open, so there's
// nothing to actually subscribe to — this just needs a render-time read that
// behaves correctly across the server/client boundary (see getServerSnapshot).
function subscribe() {
  return () => {};
}

function getSnapshot(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

// SSR has no notion of the visitor's timezone; a neutral, always-valid IANA
// zone here avoids a hydration mismatch (the same pattern used by
// usePrefersReducedMotion) — corrected to the real value on the client's
// first read, no effect/setState needed.
function getServerSnapshot(): string {
  return "Europe/London";
}

export function useDetectedTimeZone(): string {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
