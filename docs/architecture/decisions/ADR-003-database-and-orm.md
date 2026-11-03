# ADR-003 — PostgreSQL with Prisma; explicit, reviewed migrations

- **Status:** Accepted (implemented)
- **Date:** 2026-11-02

## Context

The backend already uses PostgreSQL 16 and Prisma 6 with the `multiSchema` preview capability (`identity` schema) and one migration (`20260721122627_add_identity_auth_tables`).

## Problem

We need to model the multi-tenant practice domain with database-enforced integrity: cross-tenant references, firm-scoped uniqueness, status consistency, and append-only audit. The migration process also has to be reproducible and safe.

## Options considered

1. Keep Prisma and add hand-written SQL for what Prisma can't express.
2. Move to a query builder (Kysely, Drizzle) for full SQL control.
3. Plain SQL migrations with a thin data-access layer.

## Decision

Option 1.

- **Schemas:** `identity` (users, sessions, firms, memberships), `practice` (firm-owned workspace data), `audit` (append-only events).
- **Prisma models** carry tables, enums, indexes, uniques and composite foreign keys. Prisma 6 accepts optional composite relations that share a required `firmId`; Postgres' default `MATCH SIMPLE` skips the check when the optional id is null.
- **Hand-written SQL**, appended to the migration and documented in `DOMAIN_MODEL.md`, holds:
  - CHECK constraints (slug format; task `completedAt` ⇔ `DONE`; matter `closedAt` ⇔ closed/archived; non-blank required text);
  - the audit append-only trigger.
  Prisma neither models nor drops these.
- **Deletion:** `onDelete: Restrict` and `onUpdate: Restrict` on all practice relations. Records are archived through status, not cascaded away.
- **IDs:** `uuid()` (v4), kept consistent with the existing auth tables.
- **Migration workflow:**
  - Developers create migrations with `prisma migrate dev` against their local database.
  - CI and deployments apply them with `prisma migrate deploy`.
  - Migrations never run on app boot.
  - Nothing is applied to a shared or production database by hand.
  - The migration in this phase was generated offline with `prisma migrate diff` against the previous schema. It is purely additive (no change to existing tables).

## Reasons

- Prisma is already in use, typed and productive. The pieces it can't express are small and stable.
- Composite foreign keys give database-level tenant integrity without RLS (ADR-002).

## Consequences and trade-offs

- Two sources of truth for constraints (schema plus migration SQL). Mitigated by documenting each hand-written constraint and covering each with an integration test.
- CHECK violations surface as generic Prisma errors and map to `500` if they reach the error handler. Services must validate first; CHECK constraints are the backstop.
- Prisma's interactive transactions hold a pooled connection, so keep them short.

## Security implications

- The audit trigger can be bypassed by a superuser, or by a table owner disabling triggers. Production needs separate migration/owner and application roles (`SECURITY_AND_TENANCY.md`).
- `prisma migrate reset` is destructive and must never be pointed at anything but a disposable local database. The integration test runner only accepts databases named `*_test`.

## Alternatives rejected

- **Query builder:** gives up generated types and the existing auth repository for flexibility we don't currently need.
- **Plain SQL:** more boilerplate, with no safety gain over Prisma plus SQL constraints.

## Revisit when

- Row-Level Security is adopted (ADR-002). This needs per-transaction `SET LOCAL`, which may favour a thin wrapper around Prisma's `$transaction`.
- Reporting needs outgrow Prisma, in which case add a read-only reporting path rather than replacing the ORM.
