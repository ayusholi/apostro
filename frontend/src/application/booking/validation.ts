import { z } from "zod";

/**
 * Structural validation lives here (application layer), not in the Server
 * Action — so any future consumer of these use cases (a REST endpoint, a
 * script) gets the same guarantees, and the rule "what makes a booking
 * request valid" isn't duplicated between a route handler and a use case.
 */
export const createBookingSchema = z.object({
  serviceSlug: z.string().min(1),
  solicitorSlug: z.string().min(1),
  officeId: z.string().min(1),
  slotStartUtc: z.string().datetime({ message: "Choose a time slot." }),
  displayTimeZone: z.string().min(1),
  client: z.object({
    name: z.string().trim().min(2, "Enter your full name.").max(120),
    email: z.string().trim().email("Enter a valid email address."),
    phone: z
      .string()
      .trim()
      .min(7, "Enter a valid phone number.")
      .max(30)
      .regex(/^[0-9+()\-.\s]+$/, "Enter a valid phone number."),
    notes: z.string().trim().max(1000, "Keep notes under 1000 characters.").default(""),
  }),
  spam: z.object({
    // Deliberately unconstrained here — a filled honeypot is a spam signal,
    // not a validation error, and must reach SpamGuard as-is to be judged
    // there (a bot filling it shouldn't get a helpful field-level message).
    honeypot: z.string(),
    renderedAtMs: z.number(),
  }),
});

export const rescheduleBookingSchema = z.object({
  token: z.string().min(1),
  newSlotStartUtc: z.string().datetime(),
});

export function zodFieldErrors(error: z.ZodError): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    (out[key] ??= []).push(issue.message);
  }
  return out;
}
