import { z } from 'zod';

/**
 * The single source of truth for what `process.env` must look like.
 * Parsed once, eagerly, at process boot (see ./index.ts) — never read
 * `process.env` directly outside this module (INFRASTRUCTURE-DESIGN.md §5).
 */
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),

  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),

  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),

  // Comma-separated list, parsed into an array in ./index.ts.
  CORS_ORIGINS: z.string().default(''),
  TRUST_PROXY: z.string().default('false'),

  // RS256 keypair (AUTH-DESIGN.md §2.1). PEM strings — literal "\n"
  // sequences are unescaped in ./index.ts, so a multi-line key can be
  // stored as a single env-var line. Required, no default: an unset
  // signing key must crash the process, not start it unauthenticatable
  // or (worse) with a shared example key.
  JWT_PRIVATE_KEY: z.string().min(1),
  JWT_PUBLIC_KEY: z.string().min(1),
  JWT_ACCESS_TOKEN_TTL_SECONDS: z.coerce.number().int().positive().default(900),
});

export type Env = z.infer<typeof envSchema>;
