# Backend Folder Structure — ALLS Solicitors (Express edition)

Design document. **No implementation code** — this defines the folder layout and the rationale behind it.

> **Stack note.** [`ARCHITECTURE.md`](./ARCHITECTURE.md) was written around NestJS + full hexagonal ports/adapters. This document deliberately targets a **lighter Express.js structure** per the brief ("simple, modular, avoid enterprise complexity, organize by feature"). The *domain* decisions carry over unchanged — same modules, same [`DATABASE-DESIGN.md`](./DATABASE-DESIGN.md), same [`API-DESIGN.md`](./API-DESIGN.md) surfaces — but the wiring is plain Express Routers + a service layer, not a DI container. Where the two disagree on ceremony, this document wins for the Express build.

---

## 1. The one principle everything follows

**Organize by feature, not by technical layer.** A new developer fixing a booking bug should open **one folder** (`modules/appointments/`) and find the route, the controller, the business logic, the validation, and the DB access — not hop between a top-level `controllers/`, `services/`, and `repositories/` that each contain a slice of every feature.

So the requested "Routes / Services / Controllers / Repositories" are **not top-level folders**. They are **files inside each feature module**. The only technical-layer folders that stay global are the genuinely cross-cutting ones (config, middleware, db, shared) — the things every feature consumes but none owns.

Three guardrails keep it from over-engineering:

1. **A repository only exists where it earns its place** (see §4). Simple CRUD talks to Prisma directly from the service.
2. **No abstraction without a second implementation in sight.** No interfaces/ports for their own sake — Express + Prisma are the concrete stack, not a detail we're hiding behind three layers.
3. **Flat `modules/` by default.** Sub-grouping (cms vs core) is offered as a *later* option (§7), not paid for on day one.

---

## 2. Top-level tree

```
backend/
├── prisma/
│   ├── schema.prisma            # the schema from DATABASE-DESIGN.md
│   ├── migrations/              # incl. raw-SQL for btree_gist + the EXCLUDE constraint
│   └── seed.ts                  # synthetic data (from frontend/src/data/*)
│
├── src/
│   ├── app.ts                   # builds the Express app: middleware chain + mounts routes. NO listen()
│   ├── server.ts                # imports app, starts the HTTP listener (graceful shutdown)
│   ├── worker.ts                # BullMQ worker entrypoint — same image, different start command
│   │
│   ├── config/                  # env parsing + validation, typed config object
│   ├── db/                      # Prisma client + Redis client singletons
│   ├── middleware/              # cross-cutting Express middleware
│   ├── validation/             # the validate() runner + shared schemas (pagination, id params)
│   ├── queues/                  # BullMQ connection, queue registry, processor wiring
│   ├── docs/                    # Swagger/OpenAPI setup + served spec
│   ├── shared/                  # framework-free utilities every feature may import
│   │
│   ├── routes/
│   │   └── v1.ts                # the /api/v1 router: mounts every module router under its surface
│   │
│   └── modules/                 # ← THE FEATURES (each self-contained; see §3)
│       ├── auth/
│       ├── users/
│       ├── roles/
│       ├── appointments/
│       ├── enquiries/           # Contact Enquiries
│       ├── practice-areas/
│       ├── solicitors/
│       ├── reviews/
│       ├── blog/
│       ├── faq/
│       ├── homepage/
│       ├── offices/             # Office Locations
│       ├── media/               # Media Library
│       ├── notifications/
│       └── audit/               # Audit Logs
│
├── test/                        # e2e / integration tests (unit tests live beside their module)
├── .env.example                 # every var documented; .env is gitignored
├── Dockerfile                   # multi-stage; one image serves both api and worker roles
├── docker-compose.yml           # postgres, redis, mailpit, minio, api, worker
├── tsconfig.json
└── package.json
```

**Why `app.ts` / `server.ts` / `worker.ts` are three files:** `app.ts` returns a configured Express app *without* listening, so tests (supertest) can import it directly. `server.ts` is the only place that binds a port and wires graceful shutdown. `worker.ts` boots the same codebase in worker mode — one build artifact, two run commands (ARCHITECTURE §8, §15).

---

## 3. Anatomy of a feature module

Every module has the **same predictable shape**, so learning one teaches all fifteen:

```
modules/appointments/
├── appointments.routes.ts        # express.Router() — maps METHOD+path → controller, attaches guards
├── appointments.controller.ts    # HTTP edge: reads req, calls service, shapes res. No business logic
├── appointments.service.ts       # the business logic — the heart of the module
├── appointments.repository.ts     # (ONLY where it adds value — §4) complex/raw Prisma access
├── appointments.schema.ts        # Zod request/response schemas = DTOs + validation + OpenAPI source
├── appointments.types.ts         # feature-local TypeScript types not derived from Zod
├── appointments.events.ts        # (optional) domain events this module emits (booking.confirmed)
└── appointments.test.ts          # unit tests for the service, colocated
```

The dependency direction inside a module is one-way and shallow:

```
routes → controller → service → repository → Prisma
                          │
                          └→ shared/, queues/, other modules' services (via explicit import)
```

| File | Responsibility | What it must NOT do |
|---|---|---|
| `*.routes.ts` | Declare the endpoints for this module, attach `authenticate` / `authorize(permission)` / `validate(schema)` middleware, point at controller methods. | Contain logic. |
| `*.controller.ts` | Translate HTTP ↔ service: pull typed input off `req`, call one service method, map the result (or thrown `AppError`) to a response. Thin. | Touch Prisma, contain branching business rules. |
| `*.service.ts` | All business rules, orchestration, transactions, event emission, calls to other modules' services. | Know about `req`/`res` or HTTP status codes. |
| `*.repository.ts` | Encapsulate non-trivial persistence (raw SQL, the `EXCLUDE` catch, multi-step transactions). | Exist at all for plain CRUD. |
| `*.schema.ts` | One Zod definition per payload → drives validation middleware, controller typing, and the Swagger doc. | Duplicate rules already in the DB. |

This maps the brief's requested layers precisely: **Routes, Controllers, Services, Repositories, Validation** all live here, per feature, instead of being scattered across the tree.

---

## 4. The repository rule — "only where it adds value"

A repository is a seam between a service and Prisma. It's worth adding **only when the persistence is complex enough that mixing it into the service would obscure the business logic** — or when it needs raw SQL Prisma can't express. Otherwise it's a pass-through that adds a file and a hop for nothing.

| Add a repository | Skip it — service calls Prisma directly |
|---|---|
| **appointments** — the `EXCLUDE`-constraint insert (catch the violation → `SLOT_NO_LONGER_AVAILABLE`), availability queries, claim-before-send reminder `UPDATE`, reschedule transaction | **faq**, **homepage**, **offices**, **practice-areas** — plain CRUD + reorder |
| **auth** — refresh-token rotation + family reuse-detection, hashed-token lookups | **reviews** (mostly CRUD; the stats view is a single query) |
| **audit** — append-only writes, partition-aware reads | **solicitors**, **blog** — standard relational reads/writes Prisma handles cleanly |
| **notifications** — outbox writes inside a business transaction | **media** — metadata rows are simple; the interesting part is storage, not the DB |

The heuristic: **if the service method would otherwise contain a `$queryRaw`, a `try/catch` on a constraint, or a multi-statement `$transaction` with branching, extract a repository.** If it would contain one `prisma.thing.findMany`, don't.

---

## 5. Purpose of every major folder

### Global / cross-cutting

| Folder | Purpose | Why it's global (not per-feature) |
|---|---|---|
| **`config/`** | Load `process.env`, validate it against a Zod schema **at boot, fail loud on a miss**, export a typed `config`. No bare `process.env` reads anywhere else. | A missing secret must crash the process, not silently disable a check (ARCHITECTURE §14 — the fail-open cron bug). One place owns that. |
| **`db/`** | The single `PrismaClient` instance and the single Redis connection, exported as singletons. | Every module shares one pool; instantiating Prisma per-feature exhausts connections. |
| **`middleware/`** | Cross-cutting Express middleware: `authenticate` (JWT verify → `req.user`), `authorize(permission)` (RBAC/permission check), `validate(schema)` runner, `errorHandler` (maps `AppError` → RFC 9457 `problem+json`), `requestId`, `rateLimiter` (Redis-backed), `notFound`. | These wrap *every* route regardless of feature; they belong to the app, not a module. |
| **`validation/`** | The generic `validate(schema)` middleware and **shared** schemas (pagination params, uuid path params, sort/filter grammar). Feature-specific schemas stay in the feature's `*.schema.ts`. | Shared primitives are reused everywhere; feature payloads are not. |
| **`queues/`** | BullMQ connection, the queue registry (`email`, `sms`, `reminders`, `documents`, `cms-revalidate`…), and the mapping of queue → processor. Processors call into feature services. | Queue infrastructure is shared; jobs cross feature boundaries (a booking enqueues an email). |
| **`docs/`** | Swagger UI setup and OpenAPI assembly from the modules' Zod schemas; serves `/docs`. | The spec is the union of all modules; assembly is central. |
| **`shared/`** | Framework-free helpers any module may import: `AppError` + the stable error-code catalog, a `Result`/async wrapper, pagination/cursor helpers, the logger (pino), date/timezone utils, constants. | The common vocabulary. Must stay dependency-light — no Express, no Prisma imports here. |
| **`routes/`** | A thin aggregator (`v1.ts`) that imports each module's router and mounts it under its surface (`/api/v1/public`, `/portal`, `/admin`). | The one place that composes the modules into the versioned API — the Express analogue of a composition root. |

### Feature modules (`modules/*`)

Each owns its slice of the domain end-to-end. Grouped by the API surface they primarily serve (from `API-DESIGN.md`):

| Module | Owns | Primary surface |
|---|---|---|
| **`auth`** | staff + client login, JWT issue/refresh/rotate, MFA, password reset | admin + portal |
| **`users`** | staff account CRUD, role assignment, session management | admin |
| **`roles`** | roles, permissions, role→permission mapping | admin |
| **`appointments`** | bookings, availability, cancel/reschedule, reminders (the strong-consistency module) | public + admin + portal |
| **`enquiries`** | contact-form submissions, triage, assignment (spam-guarded) | public + admin |
| **`practice-areas`** | practice areas (the domain's `Service`) | public + admin |
| **`solicitors`** | solicitor profiles, working hours, area/office assignment | public + admin |
| **`reviews`** | reviews + video testimonials, moderation, stats | public + admin |
| **`blog`** | posts, categories, tags, authors, publish/schedule | public + admin |
| **`faq`** | FAQ entries | public + admin |
| **`homepage`** | homepage sections, firm values, stats | public + admin |
| **`offices`** | office locations | public + admin |
| **`media`** | media-library metadata, presigned-upload tickets (public assets only) | admin |
| **`notifications`** | delivery log, templates, consent, provider webhooks | admin + portal + public |
| **`audit`** | append-only audit log (read-only API) | admin |

---

## 6. Concrete contrast — simple vs. complex module

Shows the repository rule in the tree itself:

```
modules/faq/                         modules/appointments/
├── faq.routes.ts                    ├── appointments.routes.ts
├── faq.controller.ts                ├── appointments.controller.ts
├── faq.service.ts    ← talks to     ├── appointments.service.ts
├── faq.schema.ts        Prisma      ├── appointments.repository.ts   ← EXCLUDE, availability,
└── faq.test.ts          directly    ├── appointments.schema.ts          claim-before-send
                                     ├── appointments.events.ts       ← emits booking.confirmed
   (no repository — plain CRUD)      └── appointments.test.ts
```

Same conventions, different weight. A developer reads both fluently because the filenames and roles are identical; the only difference is the files a simple module doesn't need.

---

## 7. Scalability — what changes as the team/app grows (and what doesn't)

The structure is designed so growth is **additive**, never a reshape:

- **New feature** → new folder in `modules/` with the standard files, one line in `routes/v1.ts`. Nothing else moves.
- **A module gets heavy** → its service grows a repository, then splits into `service/` + `repository/` sub-folders *within that module only*. The blast radius is one folder.
- **Cross-module side effects** → use `queues/` + module `events.ts` (a booking emits `booking.confirmed`; notifications and audit subscribe). Modules call each other's **services** by explicit import — never each other's Prisma tables. This is the one rule that keeps modules decoupled (ARCHITECTURE §2.3) without any DI framework.
- **Optional CMS/core grouping (defer until it hurts):** if `modules/` gets crowded, group into `modules/cms/{practice-areas,solicitors,reviews,blog,faq,homepage,offices,media}` and `modules/core/{auth,users,roles,appointments,enquiries,notifications,audit}`, mirroring the two contexts and the DB schemas. **Not done on day one** — a flat list of fifteen folders is easier for a newcomer than a nested taxonomy, and the split is a 20-minute move when the folder count actually becomes the problem.

---

## 8. What this structure deliberately does NOT have

Guardrails against the over-engineering the brief warns off:

- **No top-level `controllers/` / `services/` / `repositories/`** — that's layer-first, the thing we're avoiding.
- **No ports/adapters/interfaces for single implementations** — Prisma and Express are the stack, not hidden dependencies. (The one real seam — swappable storage/email providers — lives behind a small `shared` or `queues` helper, not a ceremony of interface folders.)
- **No DI container** — Express doesn't need one; modules import what they use. `routes/v1.ts` is the composition point.
- **No `entities/` / `dto/` / `mappers/` split** — Prisma models are the entities; Zod schemas are the DTOs; controllers do the trivial mapping inline.
- **No per-feature config or db clients** — those stay global singletons.

The result: fifteen predictable feature folders, seven small cross-cutting folders, and a rule for when to add a repository. A new developer can be productive in one module without understanding the other fourteen — which is the actual goal.
