import { AsyncLocalStorage } from 'node:async_hooks';

interface RequestContext {
  requestId: string;
}

/**
 * Carries the correlation id across async boundaries within one request —
 * into log lines, and eventually into job payloads so a worker's logs link
 * back to the request that queued them (ARCHITECTURE.md §10,
 * INFRASTRUCTURE-DESIGN.md §9). Set once, in middleware/requestId.ts.
 */
const storage = new AsyncLocalStorage<RequestContext>();

export function runWithRequestContext<T>(context: RequestContext, callback: () => T): T {
  return storage.run(context, callback);
}

export function getRequestId(): string | undefined {
  return storage.getStore()?.requestId;
}
