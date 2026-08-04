import Redis from 'ioredis';
import { config } from '../config';
import { logger } from '../shared/logger';

/**
 * The general-purpose Redis singleton — sessions, caching, rate limiting
 * (none of which are wired up yet; this is the connection they'll share).
 * BullMQ uses its *own* dedicated connection (see queues/connection.ts) —
 * the two must never be shared (INFRASTRUCTURE-DESIGN.md §7).
 *
 * A bounded retry strategy is deliberate here and differs from the BullMQ
 * connection: this client backs synchronous request handling, so a
 * genuinely broken REDIS_URL should fail fast and loud at boot rather than
 * retry forever in the background (ARCHITECTURE.md §14).
 */
export const redis = new Redis(config.redis.url, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    if (times > 10) return null; // stop retrying — surfaces as a connection error
    return Math.min(times * 200, 2000);
  },
});

redis.on('error', (err) => {
  logger.error({ err }, 'Redis client error');
});

/** Backs the readiness probe (health/health.routes.ts) — a live check, not a cached flag. */
export async function checkRedisConnection(): Promise<boolean> {
  try {
    const reply = await redis.ping();
    return reply === 'PONG';
  } catch (err) {
    logger.error({ err }, 'Redis health check failed');
    return false;
  }
}
