/**
 * Cookie-consent categories and storage shape — the "business rules" half of
 * the consent system, kept separate from useCookieConsent.ts (the browser-API
 * access half) so what a consent choice *means* isn't tangled up with how
 * it's persisted.
 */
export type ConsentCategory = "analytics" | "marketing";

export type ConsentChoice = {
  analytics: boolean;
  marketing: boolean;
};

/**
 * Bumping this forces every visitor to be re-asked — do it whenever the
 * categories on offer change materially (e.g. a marketing pixel is added),
 * per UK GDPR/PECR guidance that consent must stay specific to what it
 * actually covers, not just be assumed to carry forward.
 */
export const CONSENT_VERSION = 1;

export const CONSENT_STORAGE_KEY = `alls-cookie-consent-v${CONSENT_VERSION}`;

export const DECLINE_ALL: ConsentChoice = { analytics: false, marketing: false };
export const ACCEPT_ALL: ConsentChoice = { analytics: true, marketing: true };

export function parseStoredConsent(raw: string | null): ConsentChoice | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed?.analytics === "boolean" && typeof parsed?.marketing === "boolean") {
      return { analytics: parsed.analytics, marketing: parsed.marketing };
    }
  } catch {
    // Malformed/tampered value — treat as "not yet decided" rather than throwing.
  }
  return null;
}
