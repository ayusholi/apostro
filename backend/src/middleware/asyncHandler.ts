import type { NextFunction, Request, RequestHandler, Response } from 'express';

type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

/**
 * Forwards a rejected promise to `next(err)` so it reaches errorHandler.ts.
 *
 * Not required for a handler registered directly on this app's router —
 * Express 5 already does this automatically for anything passed straight
 * to `router.get/post/...` (see app.ts). This wrapper exists for the cases
 * that aren't that: a handler invoked outside Express's own dispatch (a
 * unit test calling it directly, a handler composed and reused elsewhere),
 * and as an explicit, self-documenting marker when reviewing code written
 * against this pattern.
 */
export function asyncHandler(handler: AsyncRequestHandler): RequestHandler {
  return (req, res, next) => {
    handler(req, res, next).catch(next);
  };
}
