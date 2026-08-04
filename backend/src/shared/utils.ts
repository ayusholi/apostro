/** Narrows `unknown` to a plain object — used wherever untrusted JSON needs a shape check before further parsing. */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Exhaustiveness check for discriminated unions/switches — a branch that
 * calls this with a value TypeScript hasn't narrowed to `never` is a
 * compile error, catching an unhandled case (e.g. a new BookingStatus)
 * before it reaches production.
 */
export function assertNever(value: never, message = 'Unhandled case'): never {
  throw new Error(`${message}: ${JSON.stringify(value)}`);
}
