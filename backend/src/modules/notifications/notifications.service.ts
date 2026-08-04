import { AppError } from '../../shared/errors';
import type {
  ConsentInput,
  ListNotificationsQuery,
  ListPortalNotificationsQuery,
  TemplateInput,
} from './notifications.schema';

/**
 * Delivery log, templates, consent ledger, unsubscribe, provider webhooks
 * (API-DESIGN.md §15). Not implemented yet — see notifications.repository.ts.
 */

// ── Admin ────────────────────────────────────────────────────────────────

export async function listNotifications(_query: ListNotificationsQuery): Promise<never> {
  throw AppError.notImplemented('Listing notifications is not implemented yet.');
}

export async function getNotification(_id: string): Promise<never> {
  throw AppError.notImplemented('Fetching a notification is not implemented yet.');
}

export async function resendNotification(_id: string): Promise<never> {
  throw AppError.notImplemented('Resending a notification is not implemented yet.');
}

export async function listTemplates(): Promise<never> {
  throw AppError.notImplemented('Listing notification templates is not implemented yet.');
}

export async function createTemplate(_input: TemplateInput): Promise<never> {
  throw AppError.notImplemented('Creating a notification template is not implemented yet.');
}

export async function updateTemplate(_id: string, _input: TemplateInput): Promise<never> {
  throw AppError.notImplemented('Updating a notification template is not implemented yet.');
}

// ── Portal ───────────────────────────────────────────────────────────────

export async function listNotificationsForClient(
  _clientId: string,
  _query: ListPortalNotificationsQuery,
): Promise<never> {
  throw AppError.notImplemented('Listing a client’s notifications is not implemented yet.');
}

// ── Consent & unsubscribe ────────────────────────────────────────────────

export async function recordConsent(
  _input: ConsentInput,
  _ipAddress: string | undefined,
): Promise<never> {
  throw AppError.notImplemented('Recording consent is not implemented yet.');
}

export async function unsubscribe(_token: string): Promise<never> {
  throw AppError.notImplemented('Unsubscribing is not implemented yet.');
}

// ── Webhooks ─────────────────────────────────────────────────────────────

/** Must verify the provider signature before trusting `payload` — never implemented as a no-op (API-DESIGN.md §15.4). */
export async function handleProviderWebhook(_provider: string, _payload: unknown): Promise<never> {
  throw AppError.notImplemented('Provider webhook handling is not implemented yet.');
}
