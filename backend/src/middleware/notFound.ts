import type { Request, Response } from 'express';

/**
 * Mounted after every router. Anything that reaches here matched no route —
 * respond with the same RFC 9457 shape as every other error (API-DESIGN.md §0.5).
 */
export function notFound(req: Request, res: Response): void {
  res
    .status(404)
    .type('application/problem+json')
    .json({
      type: 'https://alls.law/errors/not-found',
      title: 'not found',
      status: 404,
      code: 'NOT_FOUND',
      detail: `No route matches ${req.method} ${req.originalUrl}.`,
      traceId: req.id,
    });
}
