import { z } from 'zod';

/** A UUID route param — `GET /admin/bookings/:id`, etc. */
export const uuidParamSchema = z.object({
  id: z.string().uuid(),
});

/**
 * Cursor-pagination query params (API-DESIGN.md §0.3) — the default for
 * unbounded/mutable lists. Feature modules `.extend()` this with their own
 * filter/search fields rather than redefining limit/cursor/sort.
 */
export const cursorPaginationQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(20),
  cursor: z.string().optional(),
  sort: z.string().optional(),
});

/**
 * Offset-pagination query params — blog reads only, so deep links stay
 * stable and indexable (API-DESIGN.md §0.3).
 */
export const offsetPaginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

/**
 * The `PUT .../reorder` shape repeated across every CMS resource
 * (practice-areas, solicitors, offices, faq, homepage sections/values/stats
 * — API-DESIGN.md §6.2's note). A full ordered replace, not per-item PATCHes,
 * so a drag-and-drop admin UI can persist a whole list in one call.
 */
export const reorderSchema = z.object({
  orderedIds: z.array(z.string().uuid()).min(1),
});
export type ReorderInput = z.infer<typeof reorderSchema>;
