import type { Response } from 'express';

/** Cursor-paginated list envelope (API-DESIGN.md Appendix A `Paginated<T>`). */
export interface CursorPageInfo {
  nextCursor: string | null;
  hasNextPage: boolean;
}

/** Offset-paginated list envelope — blog reads only (API-DESIGN.md §0.3, Appendix A `OffsetPaginated<T>`). */
export interface OffsetPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/**
 * Consistent response shaping, so every controller produces the exact
 * envelope API-DESIGN.md commits to instead of hand-rolling `res.json(...)`
 * per route.
 */
export function sendOk<T>(res: Response, data: T): void {
  res.status(200).json(data);
}

export function sendCreated<T>(res: Response, data: T): void {
  res.status(201).json(data);
}

/** Accepted-but-not-yet-processed — e.g. a public contact enquiry queued for spam checks (API-DESIGN.md §5.1). */
export function sendAccepted<T>(res: Response, data?: T): void {
  res.status(202).json(data ?? {});
}

export function sendNoContent(res: Response): void {
  res.status(204).end();
}

export function sendPaginated<T>(res: Response, data: T[], pageInfo: CursorPageInfo): void {
  res.status(200).json({ data, pageInfo });
}

export function sendOffsetPaginated<T>(
  res: Response,
  data: T[],
  pagination: OffsetPagination,
): void {
  res.status(200).json({ data, pagination });
}
