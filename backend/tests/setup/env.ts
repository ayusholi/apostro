import { generateKeyPairSync } from 'node:crypto';

/**
 * Runs before any test module imports src/config, which validates
 * process.env once at load. Explicit values here win over a developer's
 * .env (dotenv never overrides variables that are already set).
 *
 * Unit tests get unreachable placeholder URLs, so an accidental real query
 * fails fast instead of touching a developer's database. Integration tests
 * get TEST_DATABASE_URL / TEST_REDIS_URL (checked in ./integration.ts).
 */
const { privateKey, publicKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  publicKeyEncoding: { type: 'spki', format: 'pem' },
});

process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'silent';
process.env.JWT_PRIVATE_KEY = privateKey;
process.env.JWT_PUBLIC_KEY = publicKey;
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ?? 'postgresql://unit:unit@127.0.0.1:1/unit_test';
process.env.REDIS_URL = process.env.TEST_REDIS_URL ?? 'redis://127.0.0.1:1';
