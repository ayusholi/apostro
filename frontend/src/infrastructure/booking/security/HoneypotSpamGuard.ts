import type { SpamCheckInput, SpamCheckResult, SpamGuard } from "@/application/booking/ports";
import { InMemoryRateLimiter } from "./InMemoryRateLimiter";

/** Below this, a submission is almost certainly a script filling and submitting the form faster than a human could read it. */
const MIN_FILL_TIME_MS = 3_000;

/**
 * Three independent, zero-cost-to-run checks — no reCAPTCHA/Turnstile key
 * required:
 *  1. Honeypot — a form field real users never see or fill; any value means bot.
 *  2. Timing — the form's render timestamp vs. submit time; too fast means bot.
 *  3. Rate limit — caps attempts per IP regardless of the above two.
 * A real deployment could add Turnstile/reCAPTCHA as a fourth check behind
 * this same SpamGuard interface without touching createBooking at all.
 */
export class HoneypotSpamGuard implements SpamGuard {
  private readonly limiter = new InMemoryRateLimiter(5, 15 * 60_000);

  async evaluate(input: SpamCheckInput, now: Date): Promise<SpamCheckResult> {
    if (input.honeypot.trim().length > 0) {
      return { allowed: false, reason: "honeypot" };
    }

    if (now.getTime() - input.renderedAtMs < MIN_FILL_TIME_MS) {
      return { allowed: false, reason: "too_fast" };
    }

    if (!this.limiter.consume(input.ipAddress, now.getTime())) {
      return { allowed: false, reason: "rate_limited" };
    }

    return { allowed: true };
  }
}
