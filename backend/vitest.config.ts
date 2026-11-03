import { defineConfig } from 'vitest/config';

/**
 * Two projects:
 *   unit        — no infrastructure; Prisma/Redis are mocked where touched.
 *                 `npm test`.
 *   integration — real Postgres + Redis, migrated test database.
 *                 `npm run test:integration` (scripts/test-integration.mjs
 *                 guards which database it may touch).
 */
export default defineConfig({
  test: {
    // Integration files share one database; unit files are fast either way.
    fileParallelism: false,
    projects: [
      {
        test: {
          name: 'unit',
          environment: 'node',
          include: ['tests/unit/**/*.test.ts'],
          setupFiles: ['tests/setup/env.ts'],
        },
      },
      {
        test: {
          name: 'integration',
          environment: 'node',
          include: ['tests/integration/**/*.test.ts'],
          setupFiles: ['tests/setup/env.ts', 'tests/setup/integration.ts'],
          testTimeout: 20_000,
          hookTimeout: 30_000,
        },
      },
    ],
  },
});
