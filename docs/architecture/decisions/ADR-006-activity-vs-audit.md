# ADR-006 — Matter activity timeline is separate from the audit trail

- **Status:** Accepted (implemented, minimal)
- **Date:** 2026-11-02

## Context

The workspace shows a timeline on each matter and client: task completed, message recorded, status changed. Separately, the firm needs accountability: who changed permissions or membership, and who was denied access.

## Problem

These two needs are served by different audiences, with different retention, editability and content rules. Combining them would compromise one or the other.

## Options considered

1. One event table serving both.
2. **Two tables: `practice.ActivityEvent` (tenant-owned, user-facing) and `audit.AuditEvent` (append-only, accountability).**

## Decision

Option 2.

- **`ActivityEvent`**
  - Tenant-scoped with composite foreign keys, readable by members through matter visibility.
  - Holds short summaries and ids, never message bodies or document content.
  - Written in the same transaction as the change it describes (see `tasks.service.ts`).
- **`AuditEvent`**
  - Append-only: a database trigger rejects `UPDATE`, `DELETE` and `TRUNCATE`. No foreign keys, so it survives changes to what it describes and can record attempts against non-existent firms.
  - Written by `audit.writer.ts`. `recordAuditInTransaction` is for changes whose audit must commit atomically with them; `recordAudit` is best-effort, for denials.
  - Currently recorded: `tenant.access` DENIED and `permission.check` DENIED.
  - Metadata may hold ids and small facts, never message content, credentials, tokens, or unnecessary personal data.

## Reasons

- Users must not be able to edit the audit trail, whereas activity can eventually be corrected or annotated.
- Different read paths: activity is per matter; audit is per firm, actor or resource.

## Consequences and trade-offs

Some events (a matter status change) will write to both. That duplication is intended.

## Security implications and limitations

- No API reads the audit log yet. The legacy `/admin/audit` routes are stubs.
- The trigger is bypassable by superusers and table owners, so production needs role separation.
- Successful sensitive actions (membership and role changes) aren't audited yet because no endpoints for them exist. When those endpoints are built, they must use `recordAuditInTransaction`.
- Audit retention and the GDPR erasure tension (`backend/DESIGN-REVIEW.md` P0-3) are not resolved here.
- **This is not a claim of compliance with any regulation.**

## Revisit when

- Audit volume needs partitioning (by `occurredAt`).
- Tamper evidence beyond the trigger is required (hash chaining, external write-once storage).
