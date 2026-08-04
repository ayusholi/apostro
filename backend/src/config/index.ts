import 'dotenv/config';
import { envSchema } from './env.schema';

/**
 * Fail closed, fail loud, fail at deploy (ARCHITECTURE.md §14): a missing or
 * malformed variable must crash the process before it ever accepts traffic,
 * not surface later as a mysterious 500 or — worse — a silently-disabled
 * check. `console.error` (not the pino logger) is deliberate here: the
 * logger is configured *from* this module, so it doesn't exist yet at the
 * one moment this function can fail.
 */
function loadEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    /* eslint-disable no-console -- the logger is configured from this
       module's output, so it doesn't exist yet at this specific failure. */
    console.error('✖ Invalid environment configuration:');
    console.error(JSON.stringify(parsed.error.flatten().fieldErrors, null, 2));
    /* eslint-enable no-console */
    process.exit(1);
  }

  return parsed.data;
}

const env = loadEnv();

function parseTrustProxy(value: string): boolean | string {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value; // e.g. "1" (hop count) or a subnet — passed through to Express as-is.
}

/** Allows a multi-line PEM to be stored as a single env-var line. */
function normalizePemKey(value: string): string {
  return value.includes('\\n') ? value.replace(/\\n/g, '\n') : value;
}

export const config = Object.freeze({
  app: Object.freeze({
    env: env.NODE_ENV,
    port: env.PORT,
    isProduction: env.NODE_ENV === 'production',
    isDevelopment: env.NODE_ENV === 'development',
    isTest: env.NODE_ENV === 'test',
  }),
  log: Object.freeze({
    level: env.LOG_LEVEL,
  }),
  database: Object.freeze({
    url: env.DATABASE_URL,
  }),
  redis: Object.freeze({
    url: env.REDIS_URL,
  }),
  security: Object.freeze({
    corsOrigins: env.CORS_ORIGINS.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
    trustProxy: parseTrustProxy(env.TRUST_PROXY),
  }),
  jwt: Object.freeze({
    privateKey: normalizePemKey(env.JWT_PRIVATE_KEY),
    publicKey: normalizePemKey(env.JWT_PUBLIC_KEY),
    accessTokenTtlSeconds: env.JWT_ACCESS_TOKEN_TTL_SECONDS,
  }),
});

export type Config = typeof config;
