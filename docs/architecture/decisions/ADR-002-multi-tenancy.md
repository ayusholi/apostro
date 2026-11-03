# ADR-002 — Multi-tenancy: shared schema, application scoping, composite foreign keys

- **Status:** Accepted (implemented). The PostgreSQL Row-Level Security part is **proposed**, for a later phase.
- **Date:** 2026-11-02
- **Supersedes:** the single-firm assumption in `backend/ARCHITECTURE.md`, `backend/DATABASE-DESIGN.md` and `backend/RBAC-DESIGN.md` (global staff roles for one firm, "ALLS Solicitors").

## Context

The platform will host many independent law firms. Their data is confidential and often legally privileged, so a cross-firm leak is the worst failure the system can have. Users may belong to more than one firm. The previous design assumed one firm.

## Problem

1. How is the active firm established for a request?
2. How is membership verified?
3. How does tenant context reach services?
4. How are queries scoped?
5. How are writes prevented from referencing another firm's records?
6. How is all this tested?
7. How do background jobs keep tenant context?

## Options considered

| Option | For | Against |
|---|---|---|
| Database per firm | Strongest isolation | Migrations × N, connection pools × N, cross-firm admin is hard; disproportionate for 2–10 fee-earner firms |
| Schema per firm | Strong isolation | Same migration/pool problems; Prisma handles dynamic schemas poorly |
| **Shared schema, `firmId` on every tenant row, application-enforced** | Simple ops, one migration path | A missed filter leaks data unless something backs it up |
| Shared schema + PostgreSQL RLS | Database enforces filters | Needs transaction-local tenant settings with Prisma's pooled connections, a non-owner DB role, and care with jobs and migrations |

## Decision

Shared schema, with three layers of enforcement:

1. **Context.** Tenant routes live under `/api/v1/firms/:firmId/...`. `resolveTenant()` (`backend/src/modules/tenancy/tenancy.middleware.ts`) runs after `authenticate()` and looks up an **ACTIVE membership** of an **ACTIVE firm** by an **ACTIVE user**, on every request. The URL's `firmId` is only a selector; the membership row is the proof. A request body's `firmId` is never read: strict Zod schemas reject it. Non-members get `404` (the same as a non-existent firm), and the attempt is written to the audit trail.
2. **Scoped queries.** Services receive the `TenantContext` explicitly and use `forTenant(ctx)` (`tenantPrisma.ts`), a Prisma client extension that:
   - ANDs `firmId` into every filtered operation;
   - stamps `firmId` on creates, refusing data for another firm;
   - refuses `findUnique`/`update`/`delete`/`upsert` unless they're addressed by a `firmId_…` compound key for this tenant;
   - refuses non-tenant models and unknown operations.
3. **Database constraints.** Every tenant-owned table has `@@unique([firmId, id])`, and every reference between tenant-owned rows is a **composite foreign key `(firmId, xId) → X(firmId, id)`** that shares the row's own `firmId`. Postgres rejects a Firm A row that points at a Firm B record, whichever code path wrote it. People are referenced via `FirmMembership`, never `User`, so an assignee or responsible person is always a member of the same firm.

**RLS is deferred** (see "Revisit when").

## Reasons

- Layer 3 removes the most dangerous class of bug, a write that links tenants together, at the database. Layers 1 and 2 cover reads, which constraints can't.
- Path-based firm selection is explicit in logs and URLs, works across browser tabs for multi-firm users, and keeps no hidden server-side "current firm" state.
- Application scoping is centralised in one small, pure, unit-tested function (`scopeArgs`), not repeated in every query.

## Consequences and trade-offs

- `firmId` appears in compound keys and some indexes. That's a slightly wider schema, in exchange for constraints the database enforces.
- `$queryRaw`/`$executeRaw` bypass layer 2. Raw SQL on tenant data must filter `firmId` by hand and be reviewed.
- Using the base `prisma` client on tenant models in a service bypasses layer 2. That's a code-review rule today; a lint rule is recommended.
- 404-for-non-member means a legitimately removed member sees "not found" rather than "access revoked". The frontend should handle this.

## Background jobs (rule, not yet exercised — no processors exist)

A tenant job's payload carries `{ firmId, actingMembershipId?, requestId }`, never a pre-built context. The processor re-runs `findActiveMembership` (or, for system jobs, re-checks the firm is ACTIVE) before doing work. It then uses `forTenant(ctx)` exactly as a request does, so a firm suspended or a member removed while a job was queued is respected.

## Security implications

- Isolation does not depend on the frontend hiding anything.
- It does depend on all three layers being used. The unit tests cover layers 1 and 2; the integration tests cover all three against real Postgres. **The integration tests were written but have not yet been run** (see `IMPLEMENTATION_STATUS.md`). Until they pass, isolation must not be described as verified.

## Alternatives rejected

Database-per-firm and schema-per-firm: the operational cost is out of proportion for small firms, and the composite-FK design provides most of the safety at a fraction of the cost.

## Revisit when (adopt RLS as a fourth layer)

- Before real client data is stored, if a security review requires defence in depth at the database.
- When raw SQL, reporting connections, or BI tools need direct database access.
- When more developers make missed-filter risk harder to control by review.

Adopting RLS requires:
- a non-owner application role (owners and superusers bypass policies);
- `SET LOCAL app.firm_id` inside a transaction for every tenant request (pooled connections otherwise leak settings between requests);
- `FORCE ROW LEVEL SECURITY` on tenant tables;
- a separate, audited role for migrations and platform administration;
- the same setup for every job.
