import { describe, expect, it } from 'vitest';
import { envSchema } from '../../src/config/env.schema';

const valid = {
  DATABASE_URL: 'postgresql://u:p@localhost:5432/db',
  REDIS_URL: 'redis://localhost:6379',
  JWT_PRIVATE_KEY: 'private',
  JWT_PUBLIC_KEY: 'public',
};

describe('environment configuration', () => {
  it('accepts a minimal valid environment and applies defaults', () => {
    const parsed = envSchema.parse(valid);
    expect(parsed.NODE_ENV).toBe('development');
    expect(parsed.PORT).toBe(4000);
    expect(parsed.JWT_ACCESS_TOKEN_TTL_SECONDS).toBe(900);
  });

  it.each(['DATABASE_URL', 'REDIS_URL', 'JWT_PRIVATE_KEY', 'JWT_PUBLIC_KEY'] as const)(
    'rejects a missing %s (no insecure fallback)',
    (key) => {
      const env: Record<string, string> = { ...valid };
      delete env[key];
      const result = envSchema.safeParse(env);
      expect(result.success).toBe(false);
      expect(result.error?.flatten().fieldErrors).toHaveProperty(key);
    },
  );

  it('rejects malformed values', () => {
    expect(envSchema.safeParse({ ...valid, DATABASE_URL: 'not a url' }).success).toBe(false);
    expect(envSchema.safeParse({ ...valid, PORT: '-1' }).success).toBe(false);
    expect(envSchema.safeParse({ ...valid, NODE_ENV: 'staging' }).success).toBe(false);
    expect(envSchema.safeParse({ ...valid, LOG_LEVEL: 'verbose' }).success).toBe(false);
  });

  it('coerces numeric strings from the environment', () => {
    expect(envSchema.parse({ ...valid, PORT: '8080' }).PORT).toBe(8080);
  });
});
