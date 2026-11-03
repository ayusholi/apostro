/**
 * Applies migrations to the guarded test database, then runs the
 * integration project. Uses `migrate deploy` (apply pending migrations
 * only) — never `migrate reset` or any other destructive command.
 */
import { spawnSync } from 'node:child_process';
import { assertSafeTestDatabase } from './test-database-guard';

// Fall back to backend/.env for TEST_DATABASE_URL / TEST_REDIS_URL. Variables
// already set in the shell win; the *_test guard below still applies.
try {
  process.loadEnvFile('.env');
} catch {
  // No .env file — rely on the shell environment.
}

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
assertSafeTestDatabase(testDatabaseUrl);

function run(command: string, args: string[], env: Record<string, string> = {}): void {
  const result = spawnSync(command, args, { stdio: 'inherit', env: { ...process.env, ...env } });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run('npx', ['prisma', 'migrate', 'deploy'], { DATABASE_URL: testDatabaseUrl });
run('npx', ['vitest', 'run', '--project', 'integration']);
