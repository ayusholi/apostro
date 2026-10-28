import { Resend } from "resend";
import type { EmailMessage, NotificationService } from "@/application/booking/ports";

/**
 * Production adapter — delivers through Resend. `from` must be an address on
 * a domain verified in the Resend dashboard (e.g. bookings@alls-legal.co.uk),
 * otherwise Resend rejects the send.
 */
export class ResendNotificationService implements NotificationService {
  private readonly client: Resend;

  constructor(
    apiKey: string,
    private readonly from: string,
  ) {
    this.client = new Resend(apiKey);
  }

  async send(message: EmailMessage): Promise<void> {
    // The SDK reports API failures in `error` instead of throwing — rethrow so
    // callers' catch/log paths see them like any other delivery failure.
    const { error } = await this.client.emails.send({
      from: this.from,
      to: message.to,
      replyTo: message.replyTo,
      subject: message.subject,
      html: message.html,
      text: message.text,
      attachments: message.attachments?.map((a) => ({
        filename: a.filename,
        content: Buffer.from(a.content, "utf-8"),
        contentType: a.contentType,
      })),
    });
    if (error) throw new Error(`Resend send failed (${error.name}): ${error.message}`);
  }
}
