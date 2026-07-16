import type { EmailMessage, NotificationService } from "@/application/booking/ports";

/**
 * Development adapter — logs a readable summary instead of sending real
 * email. Swap for production by implementing the same `NotificationService`
 * interface against Resend (recommended: first-class Next.js support, simple
 * API) — see /prisma/README.md "Swapping adapters" for the full checklist.
 * Every use case in application/booking already codes only against this
 * interface, so that swap never touches booking logic.
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
