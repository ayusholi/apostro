import { OpenAPIRegistry, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

// Patches `.openapi()` onto every Zod schema. Must run before any module
// calls `.openapi()` — imported as the first line of app.ts to guarantee
// that ordering regardless of what else app.ts pulls in.
extendZodWithOpenApi(z);

/**
 * The shared OpenAPI registry. Feature modules register their request/
 * response schemas and paths against this instance as they're built
 * (INFRASTRUCTURE-DESIGN.md §14) — one Zod definition drives validation,
 * typing, and this document, so there's nothing to keep in sync by hand.
 */
export const registry = new OpenAPIRegistry();
