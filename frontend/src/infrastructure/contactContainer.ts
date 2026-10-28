/**
 * Composition root for the contact form — mirrors infrastructure/container.ts
 * for booking. Reuses the same NotificationService/SpamGuard/Clock adapters
 * (just a separate instance, so contact-form rate limiting doesn't share a
 * bucket with the booking flow). Emails go through Resend when
 * RESEND_API_KEY is set — see createNotificationService.
 */
import { createNotificationService } from "./booking/notifications/createNotificationService";
import { HoneypotSpamGuard } from "./booking/security/HoneypotSpamGuard";
import { SystemClock } from "./booking/system/SystemClock";
import { sendEnquiry } from "@/application/contact/sendEnquiry";

const notifications = createNotificationService();
const spamGuard = new HoneypotSpamGuard();
const clock = new SystemClock();

const deps = { notifications, spamGuard, clock };

export const contactContainer = {
  sendEnquiry: (rawInput: unknown, ipAddress: string) => sendEnquiry(deps, rawInput, ipAddress),
};
