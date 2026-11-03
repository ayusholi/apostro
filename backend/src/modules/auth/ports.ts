import { config } from '../../config';
import { logger } from '../../shared/logger';

export interface AuthEmailMessage {
  to: string;
  template: 'email-verify' | 'password-reset' | 'firm-invitation';
  data: Record<string, string>;
}

export type EmailSender = (message: AuthEmailMessage) => Promise<void>;

/**
 * No notification module exists yet (INFRASTRUCTURE-DESIGN.md §11 designs
 * it; it isn't built). Rather than block Authentication on Notifications,
 * or silently drop the email, the default sender logs the send at `info`
 * — loud enough to be visibly wrong in every environment, including
 * production, until it's replaced. The composition root swaps in the real
 * sender (Resend/SMTP, per INFRASTRUCTURE-DESIGN.md §11) via
 * `setEmailSender` the same way `shared/permissions.ts` is wired for RBAC.
 */
let sendEmail: EmailSender = (message) => {
  logger.info(
    {
      to: message.to,
      template: message.template,
      // Development only: the payload (including one-time tokens) is logged
      // so links can be followed without a mail server. Never elsewhere.
      ...(config.app.isDevelopment ? { devData: message.data } : {}),
    },
    'No email sender configured — logging instead of sending (INFRASTRUCTURE-DESIGN.md §11)',
  );
  return Promise.resolve();
};

export function setEmailSender(sender: EmailSender): void {
  sendEmail = sender;
}

export function getEmailSender(): EmailSender {
  return sendEmail;
}
