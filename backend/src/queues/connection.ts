import Redis from 'ioredis';
import { config } from '../config';
import { logger } from '../shared/logger';

/**
 * BullMQ's dedicated Redis connection. It issues blocking commands and
 * manages its own retry semantics, which is incompatible with the general
 * client's bounded, fail-fast retry strategy (db/redis.ts) — the two must
 * not be shared (INFRASTRUCTURE-DESIGN.md §7). `maxRetriesPerRequest: null`
 * and `enableReadyCheck: false` are BullMQ's documented requirements, not
 * arbitrary choices.
 *
 * No queue exists yet — this is the connection the first `Queue`/`Worker`
 * (from the `bullmq` package) will be constructed with, once a feature
 * module needs background work (e.g. `email`, `reminders` —
 * INFRASTRUCTURE-DESIGN.md §10). worker.ts is that connection's consumer
 * today, ahead of any actual processor.
 */
export const bullConnection = new Redis(config.redis.url, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

bullConnection.on('error', (err) => {
  logger.error({ err }, 'BullMQ Redis connection error');
});
