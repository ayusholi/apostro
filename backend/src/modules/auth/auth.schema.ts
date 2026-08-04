import { z } from 'zod';

/**
 * Email is normalized (trimmed, lowercased) right here in the validation
 * layer — the one place every entry point (register, login) passes
 * through — so the `User.email` column only ever holds lowercase values.
 * That's what makes `@unique` behave case-insensitively without a `citext`
 * column (see the deviation note atop prisma/schema.prisma).
 */
const emailSchema = z.string().trim().toLowerCase().email('Enter a valid email address.');

/**
 * Length over composition rules (NIST SP 800-63B): forcing "1 uppercase, 1
 * symbol, …" measurably pushes people toward predictable, reused
 * passwords (`Password1!`) rather than stronger ones. A 12-character floor
 * is the actual lever on resistance to guessing/cracking.
 */
const passwordSchema = z
  .string()
  .min(12, 'Password must be at least 12 characters.')
  .max(256, 'Password is too long.');

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: z.string().trim().min(1, 'Full name is required.').max(200),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required.'),
  rememberMe: z.boolean().default(false),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const verifyEmailSchema = z.object({
  token: z.string().min(1),
});
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;

export const requestPasswordResetSchema = z.object({
  email: emailSchema,
});
export type RequestPasswordResetInput = z.infer<typeof requestPasswordResetSchema>;

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: passwordSchema,
});
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const sessionIdParamSchema = z.object({
  sessionId: z.string().uuid(),
});
