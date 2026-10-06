/**
 * Composition root for the contact form — mirrors infrastructure/container.ts
 * for booking. Reuses the same NotificationService/SpamGuard/Clock adapters
 * (just a separate instance, so contact-form rate limiting doesn't share a
 * bucket with the booking flow). Swap ConsoleNotificationService for a real
 * provider (Resend/SES/Postmark) in one place to make this — and booking's
 * emails — actually deliver.
 */
import { ConsoleNotificationService } from "./booking/notifications/ConsoleNotificationService";
import { HoneypotSpamGuard } from "./booking/security/HoneypotSpamGuard";
import { SystemClock } from "./booking/system/SystemClock";
import { sendEnquiry } from "@/application/contact/sendEnquiry";

const notifications = new ConsoleNotificationService();
const spamGuard = new HoneypotSpamGuard();
const clock = new SystemClock();

const deps = { notifications, spamGuard, clock };

export const contactContainer = {
  sendEnquiry: (rawInput: unknown, ipAddress: string) => sendEnquiry(deps, rawInput, ipAddress),
};
