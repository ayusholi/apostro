import { Router } from 'express';
import { checkDatabaseConnection } from '../db/prisma';
import { checkRedisConnection } from '../db/redis';

export const healthRouter = Router();

/**
 * Liveness: is the process itself alive? Deliberately checks nothing else —
 * a transient DB or Redis blip must not fail this, or the orchestrator
 * kills a healthy pod during the exact incident it should be riding out
 * (INFRASTRUCTURE-DESIGN.md §13).
 */
healthRouter.get('/live', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

/**
 * Readiness: can this instance actually serve traffic right now? Checked
 * live on every call — not a boot-time flag — so a mid-life dependency
 * outage is reflected immediately, and the load balancer pulls this
 * instance out of rotation without killing it.
 */
healthRouter.get('/ready', async (_req, res) => {
  const [database, redis] = await Promise.all([checkDatabaseConnection(), checkRedisConnection()]);
  const healthy = database && redis;

  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'unavailable',
    checks: { database, redis },
  });
});
