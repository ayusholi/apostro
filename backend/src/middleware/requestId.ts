import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { runWithRequestContext } from '../shared/requestContext';

const HEADER = 'x-request-id';
const MAX_INCOMING_LENGTH = 200;

/**
 * Establishes the correlation id for this request: reuse an incoming
 * `X-Request-Id` (a client or upstream proxy may already have set one), or
 * mint a fresh one. Must be the first middleware mounted — everything
 * downstream (pino-http, the error handler, future job enqueuing) depends
 * on `req.id` and the AsyncLocalStorage context already being set.
 */
export function requestId(req: Request, res: Response, next: NextFunction): void {
  const incoming = req.header(HEADER);
  const id = incoming && incoming.length <= MAX_INCOMING_LENGTH ? incoming : randomUUID();

  req.id = id;
  res.setHeader(HEADER, id);

  runWithRequestContext({ requestId: id }, next);
}
