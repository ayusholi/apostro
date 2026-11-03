import 'express';
import type { Principal } from '../shared/principal';
import type { TenantContext } from '../modules/tenancy/tenancy.types';

/** What validate() (validation/validate.ts) attaches after a successful parse. */
interface ValidatedRequestData {
  body?: unknown;
  query?: unknown;
  params?: unknown;
}

// Augmenting `express-serve-static-core` (not `express`) is deliberate —
// that's the module where Express's actual `Request` interface is declared;
// `express` just re-exports it.
declare module 'express-serve-static-core' {
  interface Request {
    /** Set by middleware/requestId.ts before any other middleware runs. */
    id: string;
    /** Set by middleware/authenticate.ts. Absent on unauthenticated (public) routes. */
    principal?: Principal;
    /** Set by validation/validate.ts. Absent until validate() runs for this route. */
    validated?: ValidatedRequestData;
    /** Set by modules/tenancy/tenancy.middleware.ts — a *verified* membership, never client input. */
    tenant?: TenantContext;
  }
}
