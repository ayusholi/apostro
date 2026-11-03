# System overview

_Last updated: 2026-11-02_

## Components

```text
apostro/
├── frontend/   Next.js 16 app
│   ├── (marketing)/…   public marketing site (product-owned; current single-firm content to be rebranded)
│   └── /workspace/…    practice workspace prototype — local mock data only,
│                       not yet connected to the backend
├── backend/    Express 5 + TypeScript API and BullMQ worker (one image)
│   ├── prisma/         schema, migrations, development seed
│   ├── src/
│   │   ├── config/      Zod-validated environment (fail closed at boot)
│   │   ├── db/          Prisma and Redis singletons
│   │   ├── middleware/  requestId, authenticate, authorize (legacy), errors
│   │   ├── shared/      logger, errors, JWT, pagination, request context
│   │   ├── modules/     feature modules (below)
│   │   ├── routes/v1.ts /api/v1 composition point
│   │   ├── health/      /health/live, /health/ready
│   │   ├── server.ts    API entrypoint
│   │   └── worker.ts    worker entrypoint (no processors yet)
│   └── tests/           unit (no infra) and integration (Postgres + Redis)
├── docs/architecture/  this documentation
└── template/           original static HTML template (reference only)
```

Infrastructure for local development: PostgreSQL 16 and Redis 7 via `backend/docker-compose.yml`. Mailpit and MinIO are also defined there but unused by code.

## Backend modules

| Module | State | Responsibility |
|---|---|---|
| `auth` | Implemented (pre-existing) | Register, login, refresh rotation, sessions, email verification, password reset |
| `tenancy` | **Implemented (this phase)** | Membership lookup, tenant context, firm permissions, scoped Prisma client, `/me/firms`, `/firms/:firmId` |
| `clients` | **Implemented, read-only** | List (cursor-paginated, search), detail with matters and recent activity |
| `matters` | **Implemented, read-only** | Detail, outstanding tasks, activity; `matterVisibility` choke point |
| `tasks` | **Implemented, create and complete** | Create with cross-tenant reference checks; complete with conflict handling; writes activity |
| `audit` | Writer implemented; read API is a stub | Append-only audit writes (`audit.writer.ts`) |
| Communications | Schema only | `Conversation`, `Message`, `MessageProviderRef` |
| Integrations | Documentation only | `INTEGRATION_STRATEGY.md` |
| `users`, `roles`, `enquiries`, `appointments`, CMS modules, `notifications`, `media` | Legacy single-firm stubs, return `501` | Not part of the tenant model; to be retired and rebuilt per firm (`ROADMAP.md`) |

## Request flow (tenant route)

```text
HTTP → requestId → pino-http → helmet/cors/compression/json(1mb)
     → /api/v1/firms/:firmId/...
        authenticate({allow:['staff']})   RS256 verify + Redis session allowlist
        resolveTenant()                   ACTIVE membership of ACTIVE firm → req.tenant
        requireFirmPermission('x:y')      static role → permission map
        validate({ params, query, body }) Zod (strict bodies: no firmId accepted)
        controller → service(ctx, input)
           forTenant(ctx).<model>…        firmId injected / enforced
           Postgres                       composite (firmId, id) FKs, CHECKs
     → errorHandler                       RFC 9457 problem+json with traceId
```

## API surface added in this phase

All routes are under `/api/v1`, require a staff access token, and return errors as `application/problem+json`.

| Method and path | Permission | Notes |
|---|---|---|
| `GET /me/firms` | (authenticated) | Firms the user can act in |
| `GET /firms/:firmId` | (member) | Firm summary and the caller's membership |
| `GET /firms/:firmId/clients` | `client:read` | `?limit&cursor&status&q` |
| `GET /firms/:firmId/clients/:clientId` | `client:read` | With matters and recent activity |
| `GET /firms/:firmId/matters/:matterId` | `matter:read` | Clients, responsible person, open task count |
| `GET /firms/:firmId/matters/:matterId/tasks` | `matter:read` + `task:read` | `?status=OPEN\|DONE\|CANCELLED` |
| `GET /firms/:firmId/matters/:matterId/activity` | `matter:read` | `?limit` |
| `POST /firms/:firmId/tasks` | `task:write` | `{title, description?, dueAt?, matterId?, clientId?, assigneeMembershipId?}` |
| `POST /firms/:firmId/tasks/:taskId/complete` | `task:write` | `409` if not open |

These routes are not yet in the OpenAPI document (`/docs`); the existing registry covers only earlier modules.

## Data flow for future integrations

```text
Provider (webhook / poll) → integration adapter (per provider)
   → verify, normalise → core services (Conversation/Message) via forTenant(ctx)
   → MessageProviderRef (idempotency key) → ActivityEvent
```

None of this pipeline exists yet (ADR-005).

## Development setup

See `backend/README.md` → "Local development" and "Tests".

## Deployment

The intended target (unchanged from `backend/ARCHITECTURE.md` §17) is a container per role (API and worker) from one image, managed Postgres and Redis in a UK region, and migrations applied with `prisma migrate deploy` before rollout. **Nothing is deployed yet.**
