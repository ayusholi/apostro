/**
 * Persistence for delivery log + the transactional outbox (FOLDER-
 * STRUCTURE.md §4): outbox writes inside a business transaction, so a
 * notification is never lost between "the booking committed" and "the
 * email got queued" (DATABASE-DESIGN.md §3.5 `OutboxEvent`, ARCHITECTURE
 * §8).
 *
 * Not implemented yet — `business.Notification`/`NotificationEvent`/
 * `OutboxEvent` have no Prisma model.
 */

import { AppError } from '../../shared/errors';
import type { ConsentInput, ListNotificationsQuery, TemplateInput } from './notifications.schema';

export async function listNotifications(_query: ListNotificationsQuery): Promise<never> {
  throw AppError.notImplemented('Listing notifications is not implemented yet.');
}

export async function findNotificationById(_id: string): Promise<never> {
  throw AppError.notImplemented('Notification lookup is not implemented yet.');
}

/** Writes the outbox row in the same transaction as the triggering business change (ARCHITECTURE §8). */
export async function enqueueViaOutbox(_notificationId: string): Promise<never> {
  throw AppError.notImplemented('Re-enqueueing a notification is not implemented yet.');
}

export async function recordProviderEvent(_provider: string, _payload: unknown): Promise<never> {
  throw AppError.notImplemented('Recording a provider webhook event is not implemented yet.');
}

export async function appendConsentRecord(
  _input: ConsentInput,
  _ipAddress: string | undefined,
): Promise<never> {
  throw AppError.notImplemented('Recording consent is not implemented yet.');
}

export async function findTemplateByKey(_key: string): Promise<never> {
  throw AppError.notImplemented('Template lookup is not implemented yet.');
}

export async function upsertTemplate(_input: TemplateInput): Promise<never> {
  throw AppError.notImplemented('Saving a notification template is not implemented yet.');
}
