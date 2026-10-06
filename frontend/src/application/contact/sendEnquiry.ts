import type { Clock, EmailMessage, NotificationService, SpamGuard } from "@/application/booking/ports";
import { siteConfig } from "@/config/site";
import { contactEnquirySchema, zodFieldErrors } from "./validation";
import { fail, ok, type ContactEnquiryInput, type Result } from "./dto";

export type SendEnquiryDeps = {
  notifications: NotificationService;
  spamGuard: SpamGuard;
  clock: Clock;
};

function composeEnquiryEmail(input: ContactEnquiryInput): EmailMessage {
  const name = `${input.firstName} ${input.lastName}`;
  const lines = [
    `New website enquiry from ${name}`,
    "",
    `Email: ${input.email}`,
    input.phone ? `Phone: ${input.phone}` : null,
    input.service ? `Service: ${input.service}` : null,
    `Marketing opt-in: ${input.marketingOptIn ? "Yes" : "No"}`,
    "",
    "Message:",
    input.message,
  ].filter((line): line is string => line !== null);

  return {
    to: siteConfig.email,
    subject: `New enquiry from ${name}`,
    text: lines.join("\n"),
    html: lines.map((line) => `<p>${line}</p>`).join(""),
  };
}

export async function sendEnquiry(deps: SendEnquiryDeps, rawInput: unknown, ipAddress: string): Promise<Result<true>> {
  const parsed = contactEnquirySchema.safeParse(rawInput);
  if (!parsed.success) {
    return fail("VALIDATION_FAILED", "Please check the highlighted fields.", zodFieldErrors(parsed.error));
  }
  const input: ContactEnquiryInput = parsed.data;

  const now = deps.clock.now();
  const spamResult = await deps.spamGuard.evaluate(
    { honeypot: input.spam.honeypot, renderedAtMs: input.spam.renderedAtMs, ipAddress },
    now,
  );
  if (!spamResult.allowed) {
    const message = spamResult.reason === "rate_limited" ? "Too many messages sent — please try again later." : "Submission rejected.";
    return fail(spamResult.reason.toUpperCase(), message);
  }

  await deps.notifications.send(composeEnquiryEmail(input));
  return ok(true);
}
