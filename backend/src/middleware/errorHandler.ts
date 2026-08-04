import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../shared/errors';
import { logger } from '../shared/logger';

interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  code: string;
  detail?: string;
  fieldErrors?: Record<string, string[]>;
  traceId: string;
}

const ERROR_TYPE_BASE = 'https://alls.law/errors';

function toErrorType(code: string): string {
  return `${ERROR_TYPE_BASE}/${code.toLowerCase().replace(/_/g, '-')}`;
}

/**
 * The final error-handling middleware (registered last, after every
 * router). Maps `AppError` to RFC 9457 `application/problem+json`
 * (API-DESIGN.md §0.5); anything else is an unexpected failure — logged in
 * full, but the response never leaks internals beyond a `traceId` a user
 * can quote to support (API-DESIGN.md §11 / ARCHITECTURE.md §11).
 *
 * The unused `_next` parameter is required: Express only recognizes a
 * 4-argument function as error-handling middleware.
 */
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  const traceId = req.id;
  const log = req.log ?? logger;

  if (err instanceof AppError) {
    const problem: ProblemDetails = {
      type: toErrorType(err.code),
      title: err.code.replace(/_/g, ' ').toLowerCase(),
      status: err.status,
      code: err.code,
      detail: err.detail,
      fieldErrors: err.fieldErrors,
      traceId,
    };

    if (err.status >= 500) {
      log.error({ err, traceId }, 'Request failed');
    } else {
      log.warn({ err, traceId }, 'Request failed');
    }

    res.status(err.status).type('application/problem+json').json(problem);
    return;
  }

  log.error({ err, traceId }, 'Unhandled error');

  const problem: ProblemDetails = {
    type: toErrorType('internal'),
    title: 'internal server error',
    status: 500,
    code: 'INTERNAL',
    traceId,
  };
  res.status(500).type('application/problem+json').json(problem);
}
