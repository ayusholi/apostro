import { Queue, Worker, type Processor, type QueueOptions, type WorkerOptions } from 'bullmq';
import { bullConnection } from './connection';
import { logger } from '../shared/logger';

/**
 * Split-by-queue defaults (ARCHITECTURE.md §8): exponential backoff with a
 * capped attempt count, and bounded retention so completed/failed job
 * records don't grow Redis without limit. Individual queues override via
 * `options` where their SLA differs (e.g. a stricter attempt cap for a
 * provider with tight quotas).
 */
const DEFAULT_QUEUE_OPTIONS: Partial<QueueOptions> = {
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: { age: 24 * 60 * 60 }, // 24h — enough to debug a recent run
    removeOnFail: { age: 7 * 24 * 60 * 60 }, // 7d — long enough to notice and alert on
  },
};

/**
 * Creates a BullMQ producer bound to the shared dedicated connection
 * (INFRASTRUCTURE-DESIGN.md §10). Call once per queue name, in the module
 * that owns it, and export the instance — don't construct a `Queue` for
 * the same name more than once per process.
 */
export function createQueue<DataType = unknown>(
  name: string,
  options?: Partial<QueueOptions>,
): Queue<DataType> {
  return new Queue<DataType>(name, {
    connection: bullConnection,
    ...DEFAULT_QUEUE_OPTIONS,
    ...options,
  });
}

/**
 * Creates a BullMQ worker bound to the shared connection, with structured
 * failure logging wired in by default so a failing job is never silently
 * dropped (ARCHITECTURE.md §8 — a silent DLQ is a data-loss bug with extra
 * steps). Registered from worker.ts as each processor is added.
 */
export function createWorker<DataType = unknown>(
  name: string,
  processor: Processor<DataType>,
  options?: Partial<WorkerOptions>,
): Worker<DataType> {
  const worker = new Worker<DataType>(name, processor, {
    connection: bullConnection,
    ...options,
  });

  worker.on('failed', (job, err) => {
    logger.error({ err, jobId: job?.id, queue: name }, 'Job failed');
  });

  return worker;
}
