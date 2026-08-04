import { AppError } from './errors';
import { isRecord } from './utils';

/**
 * Opaque cursor payload — encodes `(sortValue, id)` (API-DESIGN.md §0.3).
 * The `id` tiebreak is what keeps pagination stable when many rows share
 * the same sort value (e.g. identical `createdAt` timestamps).
 */
export interface CursorPayload {
  sortValue: string | number;
  id: string;
}

/** Encodes a cursor for the *next* page — opaque to the client by design, so the sort/id shape can change without breaking a stored link. */
export function encodeCursor(payload: CursorPayload): string {
  return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
}

/** Decodes a client-supplied cursor. Throws AppError.validation on anything malformed or tampered with — a bad cursor is a 400, never a crash. */
export function decodeCursor(cursor: string): CursorPayload {
  let parsed: unknown;

  try {
    parsed = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8'));
  } catch {
    throw AppError.validation({ cursor: ['Invalid pagination cursor.'] });
  }

  if (
    !isRecord(parsed) ||
    !('id' in parsed) ||
    !('sortValue' in parsed) ||
    typeof parsed.id !== 'string' ||
    (typeof parsed.sortValue !== 'string' && typeof parsed.sortValue !== 'number')
  ) {
    throw AppError.validation({ cursor: ['Invalid pagination cursor.'] });
  }

  return { id: parsed.id, sortValue: parsed.sortValue };
}
