import type { EmailMessage, NotificationService } from "@/application/booking/ports";

/**
 * Development adapter — logs a readable summary instead of sending real
 * email. Used whenever RESEND_API_KEY is unset; with it set,
 * createNotificationService returns ResendNotificationService instead.
 */
export class ConsoleNotificationService implements NotificationService {
  async send(message: EmailMessage): Promise<void> {
    const attachmentNote = message.attachments?.length
      ? ` (+${message.attachments.length} attachment${message.attachments.length > 1 ? "s" : ""}: ${message.attachments.map((a) => a.filename).join(", ")})`
      : "";
    console.log(
      `\n[email] -> ${message.to}\n  Subject: ${message.subject}${attachmentNote}\n  ---\n  ${message.text.split("\n").join("\n  ")}\n`,
    );
  }
}
