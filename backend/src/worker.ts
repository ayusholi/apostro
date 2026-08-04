import { logger } from './shared/logger';
import { prisma } from './db/prisma';
import { redis } from './db/redis';
import { bullConnection } from './queues/connection';

const log = logger.child({ role: 'worker' });
const HEARTBEAT_INTERVAL_MS = 5 * 60 * 1000;

async function waitForRedisReady(): Promise<void> {
  if (redis.status === 'ready') return;
  await new Promise<void>((resolve, reject) => {
    redis.once('ready', resolve);
    redis.once('error', reject);
  });
}

/**
 * The worker entrypoint — same image as the API, different process
 * (`node dist/worker.js`), so a slow job never competes with HTTP handling
 * for the event loop (ARCHITECTURE.md §8, §15).
 *
 * No queues/processors exist yet — this is the entrypoint the first one
 * registers against, once a feature module needs background work (see
 * queues/connection.ts and INFRASTRUCTURE-DESIGN.md §10). The open Redis
 * connections keep the process alive in the meantime; the heartbeat below
 * just gives an operator visible proof-of-life while that's true.
 */
async function main(): Promise<void> {
  await prisma.$connect();
  log.info('Connected to database');

  await waitForRedisReady();
  log.info('Connected to Redis');

  const heartbeat = setInterval(() => {
    log.info({ processors: 0 }, 'Worker heartbeat — no processors registered yet');
  }, HEARTBEAT_INTERVAL_MS);
  heartbeat.unref();

  log.info('Worker ready');

  const shutdown = (signal: string): void => {
    log.info({ signal }, 'Shutting down');
    clearInterval(heartbeat);

    Promise.allSettled([prisma.$disconnect(), redis.quit(), bullConnection.quit()])
      .then(() => {
        log.info('Shutdown complete');
        process.exit(0);
      })
      .catch((err: unknown) => {
        log.error({ err }, 'Error during shutdown');
        process.exit(1);
      });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch((err: unknown) => {
  logger.fatal({ err }, 'Failed to start worker');
  process.exit(1);
});
