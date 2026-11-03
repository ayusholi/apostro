# backend

The ALLS Solicitors API and background worker — Express, TypeScript, Prisma, Redis, BullMQ.

## Start here

The current architecture — multi-tenant, firm as the tenant boundary — is documented in [`../docs/architecture/`](../docs/architecture/README.md). Read [`IMPLEMENTATION_STATUS.md`](../docs/architecture/IMPLEMENTATION_STATUS.md) first. The design docs below predate it and describe a single-firm system; where they conflict with the ADRs in `docs/architecture/decisions/`, the ADRs win.

## Design docs (earlier, single-firm)

Read before extending this. §0 of `ARCHITECTURE.md` decides where the domain logic lives, and everything else follows from it. **Express is the canonical framework** (see the stack banner at the top of `ARCHITECTURE.md`) — the earlier NestJS framing in that document is mapped to its Express equivalent there.

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — folder structure, modules, API, auth, data, queues, security, deployment, phasing.
- [`DATABASE-DESIGN.md`](./DATABASE-DESIGN.md), [`API-DESIGN.md`](./API-DESIGN.md), [`FOLDER-STRUCTURE.md`](./FOLDER-STRUCTURE.md)
- [`AUTH-DESIGN.md`](./AUTH-DESIGN.md), [`RBAC-DESIGN.md`](./RBAC-DESIGN.md), [`INFRASTRUCTURE-DESIGN.md`](./INFRASTRUCTURE-DESIGN.md)
- [`CMS-DESIGN.md`](./CMS-DESIGN.md), [`BOOKING-DESIGN.md`](./BOOKING-DESIGN.md)
- [`DESIGN-REVIEW.md`](./DESIGN-REVIEW.md) — prioritized gaps to close before/alongside implementation.

## What's implemented

The infrastructure skeleton (config, logging, error handling, Prisma/Redis/BullMQ wiring, Swagger, Docker, health check), the shared middleware layer (auth, authz, validation, response helpers), and the first feature module: **Authentication** (`src/modules/auth/`) — register, login, logout, refresh-token rotation, email verification, password reset, and session management, against a real `identity.User` table.

```
src/
├── config/       env validation (Zod, fail-closed) + typed config, incl. JWT keys
├── db/           Prisma + Redis singletons
├── queues/       BullMQ's dedicated connection + createQueue/createWorker factories
├── validation/   validate() middleware + shared Zod schemas (pagination, uuid params)
├── shared/
│   ├── logger.ts          pino, redacted
│   ├── requestContext.ts  AsyncLocalStorage request correlation
│   ├── errors.ts          AppError + RFC 9457 error codes
│   ├── principal.ts       the authenticated-principal shape
│   ├── jwt.ts              RS256 sign/verify
│   ├── permissions.ts     RBAC permission cache + resolver (fail-closed until wired)
│   ├── crypto.ts          sha256Hex / generateOpaqueToken — opaque bearer-token primitives
│   ├── response.ts        sendOk/sendCreated/sendPaginated/… response helpers
│   ├── pagination.ts      opaque cursor encode/decode
│   └── utils.ts           isRecord, assertNever
├── middleware/
│   ├── requestId.ts / notFound.ts / errorHandler.ts
│   ├── asyncHandler.ts    promise-rejection → next(err) wrapper
│   ├── authenticate.ts    JWT verify + Redis session-liveness check
│   └── authorize.ts       permission check (authorize / authorizeAny)
├── modules/
│   └── auth/              Register / Login / Logout / Refresh / Email verify /
│                           Password reset / Session management — see below
├── docs/         OpenAPI registry + Swagger UI (served at /docs)
├── health/       GET /health/live, /health/ready
├── routes/       /api/v1 composition point — mounts /api/v1/auth
├── app.ts        composition root — builds the Express app, no listen()
├── server.ts     API entrypoint
└── worker.ts     worker entrypoint (BullMQ processors register here)
```

The Prisma schema now has its first real slice — the `identity` schema's auth tables (`User`, `Session`, `RefreshToken`, `VerificationToken`) — added incrementally per `FOLDER-STRUCTURE.md`, not generated wholesale from `DATABASE-DESIGN.md` all at once. Two deliberate deviations from that design doc, explained in `prisma/schema.prisma`'s header comment: IDs use Prisma's default `uuid()` (v4) rather than app-generated UUIDv7, and `email` is a plain `String @unique` (case-insensitivity enforced by normalizing to lowercase at the Zod boundary) rather than `citext`. Both are non-breaking to fix later. Because there's no RBAC schema yet, `authorize`'s permission lookup (`shared/permissions.ts`) still denies by default until the future Roles module calls `setPermissionResolver(...)`.

### Multi-tenant practice foundation

Firms are tenants. Routes under `/api/v1/firms/:firmId/...` run `authenticate()` → `resolveTenant()` (verifies an ACTIVE membership on every request) → `requireFirmPermission()`; services take the verified `TenantContext` and query through `forTenant(ctx)`, which forces every query on a tenant-owned model to carry that firm's id. Composite `(firmId, id)` foreign keys make Postgres reject any cross-firm reference. Details and rules: [`SECURITY_AND_TENANCY.md`](../docs/architecture/SECURITY_AND_TENANCY.md).

| Module | Routes |
|---|---|
| `tenancy/` | `GET /me/firms`, `GET /firms/:firmId` |
| `clients/` | `GET /firms/:firmId/clients`, `GET /firms/:firmId/clients/:clientId` |
| `matters/` | `GET /firms/:firmId/matters/:matterId`, `…/tasks`, `…/activity` |
| `tasks/` | `POST /firms/:firmId/tasks`, `POST /firms/:firmId/tasks/:taskId/complete` |
| `audit/audit.writer.ts` | append-only audit writes (denied access, denied permissions) |

### Authentication module (`src/modules/auth/`)

| File | Role |
|---|---|
| `auth.routes.ts` | `/api/v1/auth/*` — wires `validate()`/`authenticate()` per endpoint |
| `auth.controller.ts` | HTTP mapping only — cookie handling, response shaping |
| `auth.service.ts` | All business rules: throttling, rotation, revocation, uniform-response anti-enumeration |
| `auth.repository.ts` | Prisma queries — including the atomic claim-based refresh-rotation transaction |
| `auth.schema.ts` | Zod DTOs (email normalization and password-length policy live here) |
| `password.ts` | Argon2id hash/verify |
| `ports.ts` | `EmailSender` — swappable, defaults to logging until Notifications exists |
| `auth.constants.ts` | Token/session TTLs, throttle thresholds |

**Endpoints:** `POST /register`, `POST /login`, `POST /logout`, `POST /refresh`, `GET /me`, `POST /email/verify`, `POST /email/resend`, `POST /password/forgot`, `POST /password/reset`, `GET /sessions`, `DELETE /sessions/:sessionId`, `DELETE /sessions`.

**Security decisions worth knowing before extending this:**
- **Refresh tokens are opaque, SHA-256-hashed, and rotate on every use** (`shared/crypto.ts`, `auth.repository.ts`). Rotation is an atomic conditional `UPDATE ... WHERE consumedAt IS NULL` (a "claim," not read-then-write) — proven under real concurrent load: 10 simultaneous rotation attempts on the same token, exactly 1 succeeds, the other 9 are reported as reuse. **Reuse of an already-consumed token revokes its entire family and the owning session**, immediately, via both the Postgres row and the Redis `session:{sid}` allowlist key.
- **Argon2id**, not bcrypt — memory-hard, current OWASP/RFC 9106 recommendation.
- **Passwords: length floor (12 chars), no composition rules** — NIST SP 800-63B; composition rules measurably push people toward predictable, reused passwords.
- **Uniform responses** on login (bad email vs. bad password) and forgot-password (account exists vs. doesn't) — same status/code either way, so neither endpoint can be used to enumerate accounts. Register is the deliberate exception (409 on a taken email) since that's expected, low-risk UX, not an enumeration vector.
- **Password reset revokes every session for that account** — the reset-completer has just proven ownership via email; any session opened by someone else should not survive that.
- **Login throttling is intentionally minimal and module-local** (a per-account Redis counter + lockout, keyed off a hash of the email) — closes the "zero brute-force protection" gap now; the general Redis-backed multi-tier limiter (`INFRASTRUCTURE-DESIGN.md` §12) is separate, larger infrastructure, not yet built.
- **No RBAC/roles here** — this module is single-principal (`typ: 'staff'` on every issued token, since `User` maps to `AUTH-DESIGN.md`'s staff-style account, not the client/magic-link surface). The Roles & Permissions module is separate scope.

## Local development

```bash
cp .env.example .env      # then generate a dev JWT keypair as described inside it
npm install
npm run prisma:generate

# infra only — app runs on the host
docker compose up postgres redis -d

npm run prisma:migrate    # apply migrations to your local dev database
npm run db:seed           # fictional dev data: two firms (harlow-reyes, castle-lane-law)

npm run dev            # API, http://localhost:4000
npm run dev:worker      # worker, in a second terminal
```

Seeded users (e.g. `priya.shah@harlow-reyes.example.com`) log in through `POST /api/v1/auth/login` with the development password from `SEED_PASSWORD` or the default in `prisma/seed.ts`; then call `GET /api/v1/me/firms` and use a returned firm id in `/api/v1/firms/:firmId/...`.

## Tests

```bash
npm test                  # unit — no database or Redis needed

# integration — real Postgres + Redis; refuses any database not named *_test
docker compose up postgres redis -d
# (an existing volume needs the test DB once: docker compose exec postgres createdb -U alls alls_test)
export TEST_DATABASE_URL=postgresql://alls:alls@localhost:5432/alls_test?schema=public
export TEST_REDIS_URL=redis://localhost:6379/1
npm run test:integration  # runs `prisma migrate deploy` on the test DB, then the suite
```

Integration tests never delete data; they create uniquely named fixtures per run. Without `TEST_DATABASE_URL` the suite fails rather than skipping.

Or run everything in containers:

```bash
docker compose up --build
```

- Health: `GET /health/live`, `GET /health/ready`
- API docs: `GET /docs` (Swagger UI), `GET /docs/json` (raw OpenAPI document)
- Mailpit UI: http://localhost:8025 · MinIO console: http://localhost:9001

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` / `dev:worker` | run API / worker with hot reload (`tsx watch`) |
| `npm run build` | compile to `dist/` |
| `npm run start` / `start:worker` | run the compiled output |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` / `lint:fix` | ESLint |
| `npm run format` / `format:check` | Prettier |
| `npm run prisma:generate` | regenerate the Prisma client after a schema change |
| `npm run prisma:migrate` | create + apply a dev migration |
| `npm run prisma:deploy` | apply pending migrations (CI/CD — never on app boot) |
| `npm run prisma:validate` | validate the Prisma schema (offline) |
| `npm run db:seed` | load fictional development data (refuses `NODE_ENV=production`) |
| `npm test` / `test:watch` | unit tests |
| `npm run test:integration` | integration tests against `TEST_DATABASE_URL` / `TEST_REDIS_URL` |
