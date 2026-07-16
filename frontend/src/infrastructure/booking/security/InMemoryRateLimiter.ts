/**
 * Fixed-window rate limiter, keyed by an arbitrary string (here, IP
 * address). Same globalThis-singleton trick as the booking store, for the
 * same reason: survive Next.js dev hot-reload, and be explicit that this
 * does NOT share state across multiple serverless instances in production —
 * swap for a Redis-backed limiter (e.g. Upstash) at the same call site in
 * container.ts if deploying to more than one instance.
 */
type Window = { count: number; resetAtMs: number };

function getBuckets(): Map<string, Window> {
  const g = globalThis as unknown as { __rateLimitBuckets?: Map<string, Window> };
  if (!g.__rateLimitBuckets) g.__rateLimitBuckets = new Map();
  return g.__rateLimitBuckets;
}

export class InMemoryRateLimiter {
  constructor(
    private readonly maxAttempts: number,
    private readonly windowMs: number,
  ) {}

  /** Returns true if this key is still within its allowance; records the attempt either way. */
  consume(key: string, nowMs: number): boolean {
    const buckets = getBuckets();
    const existing = buckets.get(key);

    if (!existing || nowMs >= existing.resetAtMs) {
      buckets.set(key, { count: 1, resetAtMs: nowMs + this.windowMs });
      return true;
    }

    if (existing.count >= this.maxAttempts) return false;
    existing.count += 1;
    return true;
  }
}
