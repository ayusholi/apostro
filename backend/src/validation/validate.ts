import type { NextFunction, Request, Response } from 'express';
import type { ZodError, ZodTypeAny } from 'zod';
import { AppError } from '../shared/errors';

export interface ValidationSchemas {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

const VALIDATED_KEYS = ['body', 'query', 'params'] as const;

function flattenIssues(error: ZodError, prefix: string): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = [prefix, ...issue.path.map(String)].join('.');
    fieldErrors[key] = [...(fieldErrors[key] ?? []), issue.message];
  }
  return fieldErrors;
}

/**
 * Zod boundary validation — the syntactic layer (API-DESIGN.md §0.5, §12).
 * Parsed (typed, coerced, defaulted) values are attached to `req.validated`
 * rather than overwriting `req.query`/`req.body` in place: those properties
 * are Express's to own, and their shape/mutability varies across Express
 * versions — writing to a dedicated property sidesteps that entirely.
 * Controllers read via `getValidated(req, 'body')`.
 */
export function validate(schemas: ValidationSchemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const fieldErrors: Record<string, string[]> = {};
    const validated: NonNullable<Request['validated']> = {};

    for (const key of VALIDATED_KEYS) {
      const schema = schemas[key];
      if (!schema) continue;

      const result = schema.safeParse(req[key]);
      if (result.success) {
        validated[key] = result.data;
      } else {
        Object.assign(fieldErrors, flattenIssues(result.error, key));
      }
    }

    if (Object.keys(fieldErrors).length > 0) {
      throw AppError.validation(fieldErrors);
    }

    req.validated = validated;
    next();
  };
}

/** Typed read of a value validate() attached. Only call for a key this route actually validates — see validate(). */
export function getValidated<T>(req: Request, key: 'body' | 'query' | 'params'): T {
  return req.validated?.[key] as T;
}
