import { createServer } from 'node:http';
import { createApp } from './app';
import { config } from './config';
import { logger } from './shared/logger';
import { prisma } from './db/prisma';
import { redis } from './db/redis';

const log = logger.child({ role: 'api' });

async function waitForRedisReady(): Promise<void> {
  if (redis.status === 'ready') return;
  await new Promise<void>((resolve, reject) => {
    redis.once('ready', resolve);
    redis.once('error', reject);
  });
}

async function main(): Promise<void> {
  await prisma.$connect();
  log.info('Connected to database');

  // ioredis connects eagerly on construction; wait for the first successful
  // connection here so a broken REDIS_URL fails startup loudly instead of
  // surfacing later as a mysterious readiness-probe failure.
  await waitForRedisReady();
  log.info('Connected to Redis');

  const app = createApp();
  const server = createServer(app);

  server.listen(config.app.port, () => {
    log.info({ port: config.app.port }, 'API server listening');
  });

  const shutdown = (signal: string): void => {
    log.info({ signal }, 'Shutting down');

    const forceExit = setTimeout(() => {
      log.error('Graceful shutdown timed out; forcing exit');
      process.exit(1);
    }, 10_000);
    forceExit.unref();

    server.close(() => {
      Promise.allSettled([prisma.$disconnect(), redis.quit()])
        .then(() => {
          clearTimeout(forceExit);
          log.info('Shutdown complete');
          process.exit(0);
        })
        .catch((err: unknown) => {
          log.error({ err }, 'Error during shutdown');
          process.exit(1);
        });
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch((err: unknown) => {
  logger.fatal({ err }, 'Failed to start API server');
  process.exit(1);
});
