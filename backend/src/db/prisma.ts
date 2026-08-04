import { PrismaClient } from '@prisma/client';
import { logger } from '../shared/logger';

/**
 * The single PrismaClient singleton — owns the Postgres connection pool.
 * Constructed once, at module load, and injected into services as they're
 * built (INFRASTRUCTURE-DESIGN.md §2–§3). Never instantiate a second one.
 */
export const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'warn' },
    { emit: 'event', level: 'error' },
  ],
});

prisma.$on('warn', (event) => logger.warn({ prisma: event }, 'Prisma warning'));
prisma.$on('error', (event) => logger.error({ prisma: event }, 'Prisma error'));

/** Backs the readiness probe (health/health.routes.ts) — a live check, not a cached flag. */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (err) {
    logger.error({ err }, 'Database health check failed');
    return false;
  }
}
