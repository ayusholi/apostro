/**
 * The universal error codes assumed on every endpoint (API-DESIGN.md §0.5).
 * Feature modules extend this union with their own domain codes
 * (e.g. `SLOT_NO_LONGER_AVAILABLE`) as they're implemented.
 */
export type ErrorCode =
  | 'VALIDATION_FAILED'
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'RATE_LIMITED'
  | 'INTERNAL'
  | 'NOT_IMPLEMENTED';

interface AppErrorOptions {
  status: number;
  code: ErrorCode | (string & {});
  detail?: string;
  fieldErrors?: Record<string, string[]>;
}

/**
 * The application's single error type. Thrown from anywhere in the request
 * lifecycle and translated by `errorHandler` into an RFC 9457
 * `application/problem+json` response, carrying the stable `code` the
 * frontend switches on (API-DESIGN.md §0.5).
 */
export class AppError extends Error {
  readonly status: number;
  readonly code: string;
  readonly detail?: string;
  readonly fieldErrors?: Record<string, string[]>;

  constructor({ status, code, detail, fieldErrors }: AppErrorOptions) {
    super(detail ?? code);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.detail = detail;
    this.fieldErrors = fieldErrors;
  }

  static notFound(detail = 'The requested resource was not found.'): AppError {
    return new AppError({ status: 404, code: 'NOT_FOUND', detail });
  }

  static validation(
    fieldErrors: Record<string, string[]>,
    detail = 'Please check the highlighted fields.',
  ): AppError {
    return new AppError({ status: 400, code: 'VALIDATION_FAILED', detail, fieldErrors });
  }

  static unauthenticated(detail = 'Authentication is required to access this resource.'): AppError {
    return new AppError({ status: 401, code: 'UNAUTHENTICATED', detail });
  }

  static forbidden(detail = 'You do not have permission to perform this action.'): AppError {
    return new AppError({ status: 403, code: 'FORBIDDEN', detail });
  }

  /**
   * Marks a route that's wired end-to-end (routing/validation/authz) but
   * whose business logic hasn't been built yet — the scaffold state most of
   * modules/* is in until each module gets its Prisma slice
   * (FOLDER-STRUCTURE.md §3). Never meant to reach production.
   */
  static notImplemented(detail = 'This endpoint is scaffolded but not yet implemented.'): AppError {
    return new AppError({ status: 501, code: 'NOT_IMPLEMENTED', detail });
  }
}
