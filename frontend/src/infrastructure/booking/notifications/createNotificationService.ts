import type { NotificationService } from "@/application/booking/ports";
import { ConsoleNotificationService } from "./ConsoleNotificationService";
import { ResendNotificationService } from "./ResendNotificationService";

/**
 * Picks the email adapter from the environment: Resend when RESEND_API_KEY is
 * set, otherwise the console logger (local dev). Shared by every composition
 * root so booking and contact emails always go through the same provider.
 */
export function createNotificationService(): NotificationService {
  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    const from = process.env.EMAIL_FROM ?? "ALLS Solicitors <bookings@alls-legal.co.uk>";
    return new ResendNotificationService(apiKey, from);
  }
  if (process.env.NODE_ENV === "production") {
    console.error("[email] RESEND_API_KEY is not set — emails will only be logged, not delivered.");
  }
  return new ConsoleNotificationService();
}
