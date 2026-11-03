# Security and tenancy

_Last updated: 2026-11-02_

> **Status of assurance:** the tenant-isolation design is implemented and its request-pipeline and query-scoping logic pass unit tests. The database-level integration tests are written but **have not yet been run** (no database was available in the session that built them). Until they pass, tenant isolation is *implemented, not verified*. This platform is **not ready to hold real client data** — see "Before real client data" below.

## 1. Tenant isolation strategy (ADR-002)

| # | Question | Answer | Where |
|---|---|---|---|
| 1 | How is the active firm established? | URL path `/api/v1/firms/:firmId/...` — a selector only | `tenancy.routes.ts` |
| 2 | How is membership verified? | Per request: ACTIVE `FirmMembership` for the token's user, ACTIVE `Firm`, ACTIVE non-deleted `User` | `tenancy.repository.ts → findActiveMembership` |
| 3 | How does context reach services? | `req.tenant` (set only by `resolveTenant`), passed explicitly as `ctx` to every service | `tenancy.middleware.ts`, `*.service.ts` |
| 4 | How are queries scoped? | `forTenant(ctx)` Prisma extension injects/enforces `firmId`; refuses unscoped unique lookups and non-tenant models | `tenantPrisma.ts` |
| 5 | How are cross-tenant writes prevented? | Composite FKs `(firmId, xId) → X(firmId, id)`; services also pre-check references within the tenant for clear `422`s; strict bodies reject `firmId` | migration, `tasks.service.ts` |
| 6 | How is isolation tested? | Unit: `scopeArgs`, middleware, auth chain. Integration: HTTP cross-tenant attempts + direct DB constraint tests | `tests/` |
| 7 | How do jobs keep tenant context? | Payload carries `firmId` (+ acting membership); processor re-verifies membership/firm status, then uses `forTenant` | ADR-002 (rule; no processors yet) |

Non-members receive `404` for any firm-scoped URL (indistinguishable from a non-existent firm), and the attempt is recorded as `tenant.access` / `DENIED` in the audit trail.

**Rules for contributors**

- Tenant-owned data is read and written only through `forTenant(ctx)`. Using the base `prisma` client on a practice model in a service is a defect.
- `$queryRaw` / `$executeRaw` on tenant data must include `firmId = ctx.firmId` and get explicit review.
- New tenant-owned models: add `firmId`, `@@unique([firmId, id])`, composite FKs for every tenant reference, add the model name to `TENANT_MODELS`, and add an integration test for a cross-tenant reference.
- Never accept `firmId`, `userId` or `membershipId` from a request as proof of anything. Request schemas for tenant routes are `.strict()`.

## 2. Authentication boundary (ADR-004)

Implemented (pre-existing, unchanged): Argon2id; RS256 access tokens (15 min, identity-only claims); opaque SHA-256-hashed rotating refresh tokens with family revocation on reuse; Redis session allowlist checked on every request; uniform login/forgot-password responses; per-account login throttling; password reset revokes all sessions.

Invitations (Stage 2): the emailed token is 32 random bytes, stored only as SHA-256, single-use, 7-day expiry, sent in the request body (never the URL). Acceptance requires a signed-in `ACTIVE` user (so a verified email) whose email equals the invited address. Unknown, used, revoked and expired tokens get the same `400`.

Not implemented: MFA; SSO (Google/Microsoft); JWT signing-key rotation (`kid` + JWKS — `backend/DESIGN-REVIEW.md` P0-4); platform-administrator principal; client-portal principal. Invitee-without-an-account must register and verify first (no register-via-invite flow yet).

## 3. Authorisation

- **Firm level:** static role → permission map (`permissions.ts`), checked with `requireFirmPermission`; denials audited.
- **Membership changes** (`members.rules.ts`): only an `OWNER` grants the owner role, touches an owner's membership, or revokes an owner invitation; nobody modifies their own membership; every change must leave an `ACTIVE` `OWNER`. Each change locks the `Firm` row (`SELECT … FOR UPDATE`) and re-reads the actor's membership under the lock, so concurrent changes can't race past these rules. Suspension and removal take effect on the member's next request.
- **Resource level:** `matterVisibility(ctx)` is the single extension point; currently every member with `matter:read` sees every matter in their firm. **Do not store matters needing restricted access until this is implemented.**
- **Platform level:** none. No route operates across firms.

## 4. Input, errors, logging

- Zod validation at the boundary for params, query and body; tenant request bodies are strict.
- Errors are RFC 9457 `application/problem+json` with `traceId`; 500s never include messages or stacks; Prisma constraint errors map to `409 CONFLICT` / `422 INVALID_REFERENCE` / `404` without exposing constraint or column names.
- pino structured logs with request correlation (`X-Request-Id`); `authorization`, cookies, `set-cookie`, passwords and tokens are redacted. Message bodies, client contact details and audit metadata must never be logged — no code in this phase logs them.

## 5. HTTP and transport

helmet (strict CSP except `/docs`), exact-origin CORS allowlist with credentials, 1 MB body limit, `x-powered-by` disabled, `trust proxy` explicit. TLS is expected at the load balancer (not configured — nothing is deployed).

**Rate limiting:** only the auth module's per-account login throttle exists. A general per-IP / per-user limiter (`backend/INFRASTRUCTURE-DESIGN.md` §12) is outstanding and should precede any public deployment.

## 6. Audit (ADR-006)

Append-only `audit.AuditEvent` (trigger rejects UPDATE/DELETE/TRUNCATE). Recorded today: denied tenant access, denied firm permission, and — written in the same transaction as the change, so they exist if and only if it commits — `firm.create`, `invitation.create|revoke|accept`, `member.role_change|suspend|reactivate|remove`. A tenant-scoped transaction may append audit rows (stamped with its firm) but cannot read or change them. **Limitations:** no audit read API; bypassable by a superuser or table owner; retention and erasure policy undecided. This is an accountability foundation, not a compliance claim.

## 7. Secrets and configuration

All configuration validated at boot (`src/config/env.schema.ts`); missing JWT keys or URLs stop the process. `.env` is git-ignored; `.env.example` holds no real secrets. Integration credentials: plan only (`INTEGRATION_STRATEGY.md` §4).

## 8. Database roles (required before production)

Today one database user owns the schema and runs the app. Before production:
- a **migration/owner role** used only by `prisma migrate deploy`;
- an **application role** without ownership, without `TRUNCATE`, without trigger-disable rights, and with no `UPDATE/DELETE` grant on `audit.*`;
- no superuser connections from the application.

## 9. Before real client data — must be completed

1. Integration test suite passing in CI against Postgres + Redis (passes locally; CI written, not yet run).
2. Database role separation (§8); consider RLS as a fourth isolation layer (ADR-002).
3. MFA for all staff; JWT key rotation with `kid`.
4. General rate limiting; WAF in front of the API.
5. Resource-level matter restrictions if any firm needs confidential matters.
6. Encryption at rest and in transit for Postgres, Redis and backups; UK/EU data residency confirmed; Redis persistence decision (`backend/DESIGN-REVIEW.md` P1-7).
7. Audit read API restricted to `audit:read` (membership and role changes are now audited).
10. Rate limiting on firm creation and invitations (any signed-in user can create firms; admins can send unlimited invitations).
8. Data-protection work: DPIA, retention and erasure policy, subject access process, processor agreements.
9. Independent penetration test.

None of these is claimed as done.
