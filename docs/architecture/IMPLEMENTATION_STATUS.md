# Implementation status

_Update at the end of every meaningful phase. Factual only: say what was verified, and how._

## Current phase: Stage 2 — Identity and onboarding (in progress, 2026-11-03)

### What changed
**Schema and migration**: `backend/prisma/migrations/20261103120000_firm_invitations/` (additive).
- `identity.FirmInvitation`, with composite FKs for the inviter and the accepted membership.
- Hand-written: lowercase-email CHECK, single-outcome CHECKs, and a partial unique index (one pending invitation per firm + email).

**Code** (`backend/src`):
- `modules/firms/`: `POST /firms` creates the firm, an OWNER membership and a `firm.create` audit row in one transaction. The slug is derived from the name if omitted; a duplicate returns `409 SLUG_TAKEN`.
- `modules/members/`:
  - `members.rules.ts`: role rules (only owners touch owners; no self-modification).
  - `members.service.ts`: list/update/remove, `lockFirmForMembershipChange` (firm-row lock plus actor re-check), last-owner check.
  - `invitations.service.ts`: create (revokes any earlier pending one), list, revoke, accept (email must match; a removed member rejoins with the same membership id).
  - Routes: `/firms/:firmId/members`, `/firms/:firmId/invitations`, `POST /invitations/accept`.
- `tenancy/permissions.ts`: new `member:read` for every role.
- `tenancy/tenantPrisma.ts`: `FirmInvitation` is tenant-owned. Tenant transactions may *create* `AuditEvent` rows (stamped with their firm) and do nothing else on that table.
- `audit/audit.writer.ts`: `recordAuditInTransaction` accepts tenant-scoped transactions.
- `auth/ports.ts`: `firm-invitation` template. In `development` only, the logged-instead-of-sent email includes its data (the token), so links can be followed without a mail server.
- `docs/tenancy.openapi.ts`: 8 new paths (17 total).

### Checks run (2026-11-03)
| Check | Result |
|---|---|
| typecheck, lint, format, build | ✅ |
| `npm test` (unit) | ✅ **113 passed** (role-rule matrix, slugify, audit scoping added) |
| `npm run test:integration` | ✅ **47 passed** (17 new in `membership.test.ts`) |
| Mutation: firm lock removed | concurrent owner-removal test failed 3/3 runs; passes once restored |
| Mutation: email-match check removed | mismatch test failed; passes once restored |
| Dev database: migration + live smoke test | ✅ fee earner can't invite (403); owner invites; wrong user can't accept (403); invitee accepts and sees the firm in `/me/firms`; reuse → 400; a fee earner creates their own firm |

### Known gaps
- People without an account must register, verify their email and log in before accepting (no register-via-invite yet).
- No real email delivery (logged instead). In production the invitation email would not actually be sent.
- No rate limiting on firm creation or invitations.
- Removing a member doesn't reassign their open tasks or matters.
- CI hasn't run on GitHub yet.

---

## Current phase: Stage 1 — Backend foundation (closed 2026-11-03)

### What existed before this phase
- `frontend/`: Next.js 16 marketing site, plus the `/workspace` UI prototype (local mock data, not connected to any API).
- `backend/`: Express 5 / TypeScript / Prisma 6 / Redis / BullMQ app with a working **auth module** and sound operational plumbing:
  - config validation, RFC 9457 errors, pino logging with redaction, request ids, liveness and readiness checks, helmet and CORS, Docker and Compose.
- About 15 other modules (users, roles, enquiries, appointments, CMS, notifications, media, audit) were routed and validated stubs returning `501`.
- One migration (identity/auth tables). No tests, no test runner, no seed.
- A design suite (`backend/*.md`) for a **single firm**.

### What changed

**Schema and migration**: `backend/prisma/migrations/20261102120000_tenancy_practice_foundation/`. Purely additive; existing tables are untouched.
- `identity`: `Firm`, `FirmMembership`, plus `User.memberships`.
- `practice`: `Client`, `Matter`, `MatterClient`, `Task`, `Conversation`, `Message`, `MessageProviderRef`, `ActivityEvent`.
- `audit`: `AuditEvent`.
- Composite `(firmId, id)` foreign keys for every tenant reference; `RESTRICT` on delete and update.
- Hand-written CHECK constraints (slug format, task/matter status consistency, non-blank text) and an append-only audit trigger.

**Code** (`backend/src`):
- `modules/tenancy/`:
  - `tenancy.types.ts`, `permissions.ts` (role → permission map)
  - `tenancy.repository.ts` (membership lookup)
  - `tenancy.middleware.ts` (`resolveTenant`, `requireFirmPermission`, `getTenant`)
  - `tenantPrisma.ts` (`scopeArgs`, `forTenant`)
  - `tenancy.routes.ts` (`/me/firms`, `/firms/:firmId` router)
- `modules/clients/`, `modules/matters/`, `modules/tasks/` (schema, service, controller, routes).
- `modules/audit/audit.writer.ts`.
- Changes to existing files:
  - `routes/v1.ts`: mounts `/me` and `/firms/:firmId`.
  - `middleware/errorHandler.ts`: maps Prisma P2002/P2003/P2025 to 409/422/404 without leaking schema details.
  - `shared/errors.ts`: adds `CONFLICT` and `INVALID_REFERENCE`.
  - `types/express.d.ts`: adds `req.tenant`.
  - `db/redis.ts`: `lazyConnect` in tests.

**Tooling**:
- Vitest and Supertest dev dependencies; `vitest.config.ts` (unit and integration projects).
- `tsconfig.json` now type-checks tests, seed and scripts; `tsconfig.build.json` compiles `src` only (the Dockerfile copies it).
- `scripts/test-integration.ts` and `scripts/test-database-guard.ts`: the integration runner only accepts `*_test` databases and applies migrations with `migrate deploy`, never reset.
- `prisma/seed.ts`: idempotent, fictional data, refuses production.
- npm scripts: `test`, `test:watch`, `test:integration`, `db:seed`, `prisma:validate`.

**Docker Compose**:
- Postgres init script creates `alls_test` on a fresh volume.
- **Fixed a pre-existing bug:** the `api` and `worker` services had no JWT keys, so they would exit at config validation. They now load `.env` (optional), and the explicit container URLs still override it.

**Docs**:
- This folder (`docs/architecture/`) with ADR-001 to ADR-006.
- `backend/README.md`, `backend/.env.example` and the root `README.md` updated.

### Checks run (2026-11-02, final run)

| Command (in `backend/`) | Result |
|---|---|
| `npx prisma validate` | ✅ valid |
| `prisma migrate diff` (previous schema → current) vs committed migration | ✅ identical (388 generated lines) plus the hand-written section |
| `npm run typecheck` (src + tests + seed + scripts) | ✅ 0 errors |
| `npm run lint` | ✅ 0 problems |
| `npm run format:check` | ✅ clean |
| `npm test` (unit) | ✅ **92 passed**, 4 files |
| `npm run build` | ✅ compiles `src` only |
| `docker compose config --quiet` | ✅ valid |
| `npm run test:integration` without `TEST_DATABASE_URL`, and with a non-`_test` database | ✅ refuses before connecting; running the integration project directly **fails** (no silent skip) |
| **`npm run test:integration` against Postgres 16 + Redis 7** (2026-11-03) | ✅ **30 passed** (constraints 15, tenant isolation 15). Also passes with only `.env` set. |
| `prisma migrate deploy` + `db:seed` against real Postgres (test and dev databases) | ✅ both migrations applied cleanly; seed created 2 firms |
| API smoke test (dev database) | ✅ login → `/me/firms` → clients list/get, matter get/tasks/activity all 200; a matter id from another firm → 404; other firm's id in the path → 404 with a `DENIED tenant.access` audit row; no token → 401 |
| OpenAPI (`/docs/json`) | ✅ now lists all 8 tenant paths plus `/me/firms` and health |

**Mutation check:** the scoping guard (dropping the firm filter) and the membership check (granting access without a membership) were each broken on purpose. The unit tests failed in both cases, and passed again once the code was restored.

### Status by area

| Area | State |
|---|---|
| Tenant context (membership verified per request, 404 and audit for non-members, body `firmId` rejected) | Implemented and unit-tested (HTTP pipeline with DB/Redis doubles). Integration tests written, not run. |
| Query scoping (`scopeArgs` / `forTenant`) | Implemented; logic unit-tested (24 tests). Behaviour against real Prisma is covered by integration tests that haven't been run. |
| Composite FKs, CHECK constraints, audit append-only trigger | Implemented in the migration. **Not executed against Postgres yet.** |
| Firm permissions (role → permission matrix) | Implemented and unit-tested (44-case matrix); denial audit unit-tested. |
| Config validation, error format, health endpoints, protected-route auth | Unit-tested. |
| Client, matter and task endpoints | Implemented; type-checked. Only exercised by the unexecuted integration tests. |
| Communications | Schema only. No API, no ingestion. |
| Integrations, credentials, webhooks | Documented only (ADR-005, `INTEGRATION_STRATEGY.md`). |
| Matter restrictions, platform admin, invitations, MFA, rate limiting, RLS | Not implemented; documented. |
| Frontend | Unchanged in this phase; still uses mock data. |

### Outstanding issues and risks
1. **CI exists but has never run.** `.github/workflows/backend.yml` (lint, format, typecheck, unit, integration with Postgres/Redis service containers, build) was written but not executed on GitHub; it needs a push to confirm. The repo also has no remote-run history yet.
2. Response bodies in the OpenAPI document are described loosely (`object`); request schemas are the real Zod schemas.
3. Matters have no list endpoint yet (get, tasks and activity only) — needed for the workspace UI in Stage 3.
4. `package.json#prisma` (seed configuration) is deprecated in favour of `prisma.config.ts`; it still works in Prisma 6. Migrate it when upgrading to Prisma 7.
5. Legacy single-firm stub modules remain mounted (they return `501`) and use the global `authorize()` path, which denies by default. Decided 2026-11-03: they will be retired and rebuilt per firm (`ROADMAP.md`).
6. Base-client use on tenant models is enforced by review, not tooling.

### Security limitations
See `SECURITY_AND_TENANCY.md` §9. The platform is **not ready for real client data**.

### Recommended next step
Commit Stage 1 (everything is still uncommitted), push to confirm CI passes, then start Stage 2 (firm creation, invitations, membership management with transactional audit). If a working UI is the priority, start the Stage 3 work-queue and matter-list endpoints and connect `/workspace`.
