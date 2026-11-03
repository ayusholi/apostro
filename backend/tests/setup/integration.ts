import { afterAll } from 'vitest';
import { assertSafeTestDatabase } from '../../scripts/test-database-guard';

// Fail loudly — never silently skip — when there's no test database.
assertSafeTestDatabase(process.env.TEST_DATABASE_URL);
if (!process.env.TEST_REDIS_URL) {
  throw new Error('TEST_REDIS_URL is required for integration tests (see backend/README.md).');
}

afterAll(async () => {
  const [{ prisma }, { redis }] = await Promise.all([
    import('../../src/db/prisma'),
    import('../../src/db/redis'),
  ]);
  await Promise.allSettled([prisma.$disconnect(), redis.quit()]);
});
