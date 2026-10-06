import { z } from "zod";

/** Mirrors application/booking/validation.ts's shape — structural validation lives here, not in the Server Action. */
export const contactEnquirySchema = z.object({
  firstName: z.string().trim().min(1, "Enter your first name.").max(80),
  lastName: z.string().trim().min(1, "Enter your last name.").max(80),
  email: z.string().trim().email("Enter a valid email address."),
  phone: z
    .string()
    .trim()
    .max(30)
    .regex(/^[0-9+()\-.\s]*$/, "Enter a valid phone number.")
    .optional()
    .default(""),
  service: z.string().trim().max(120).optional().default(""),
  message: z.string().trim().min(1, "Enter a message.").max(2000, "Keep your message under 2000 characters."),
  marketingOptIn: z.boolean().default(false),
  spam: z.object({
    honeypot: z.string(),
    renderedAtMs: z.number(),
  }),
});

export function zodFieldErrors(error: z.ZodError): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    (out[key] ??= []).push(issue.message);
  }
  return out;
}
