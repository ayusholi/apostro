import { siteConfig } from "./site";

/**
 * Inbox that receives staff notifications (new/cancelled/rescheduled bookings,
 * contact-form enquiries). Server-only — read from ADMIN_NOTIFICATION_EMAIL,
 * falling back to the firm's public address.
 */
export const adminNotificationEmail = process.env.ADMIN_NOTIFICATION_EMAIL || siteConfig.email;
