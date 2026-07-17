# Backend Architecture — ALLS

Design document. No implementation yet.

**Audience:** whoever builds and reviews this. Every decision below states *why*, and where a decision is reversible, what would reverse it.

---

## 0. The decision everything else depends on

Before any of the eighteen sections: **the backend is not greenfield.** The frontend already contains a real, well-built hexagonal core.

`frontend/src/` today:

| Layer | What's there |
|---|---|
| `domain/` | Booking policy, availability computation, `TimeSlot`, `DomainError` hierarchy with stable codes, timezone handling, `.ics` generation, blog reading-time/TOC, review stats |
| `application/` | Use cases (`createBooking`, `cancelBooking`, `rescheduleBooking`, `getAvailability`, `sendDueReminders`, …), `Result<T>` envelope, Zod schemas, email composition |
| `infrastructure/` | `InMemoryBookingRepository`, `Static*Repository`, `ConsoleNotificationService`, `HoneypotSpamGuard`, `SystemClock`, `CryptoIdGenerator` |
| composition roots | `container.ts`, `blogContainer.ts`, `reviewsContainer.ts`, `teamContainer.ts` |
| forward-compat | `prisma/schema.prisma` — already written, matches the domain entities field-for-field |

This is not a dumb frontend with some fetch calls. **The business rules live there, and they are good.** Any backend design that ignores this produces a second copy of the booking rules, and two copies of a rule always drift. When they drift, the site shows availability the backend rejects.

So the first decision is not "what modules does the backend have" — it's **who owns the domain.**

### Recommendation: the backend takes ownership; the domain code moves, it is not rewritten

Three options were considered.

| Option | Verdict |
|---|---|
| **A. Backend owns domain. Frontend becomes a rendering client.** Move `domain/` + `application/` into the backend; frontend calls HTTP. | **Chosen.** |
| **B. Backend serves only the new features** (admin, CMS, portal); frontend keeps booking and talks to Postgres itself. | Rejected. Two writers to one database, two copies of the booking rules, two places to fix a bug. The admin dashboard must cancel bookings — under B it reimplements `cancelBooking`. |
| **C. Shared domain package** consumed by both; both write to the DB. | Rejected as a destination, borrowed in part. Sharing the *rules* still leaves two writers, so the `EXCLUDE` constraint becomes the only thing preventing a double-booking and the frontend needs DB credentials. But sharing the *contract* is right — see below. |

**Why A wins on the actual requirement list.** The future features are client portal, case management, secure documents, RBAC, audit logs, payments. None of those can live behind Next.js Server Actions with in-memory adapters. The moment a client's matter file is in play you need a service with a real security boundary, a real audit trail, and a deployment story that isn't "whatever Vercel does". Once *that* service exists, having bookings live somewhere else is indefensible.

**What moves, what stays.**

- **Moves to backend:** all of `application/`, all of `domain/` *except* the render-time helpers, all of `infrastructure/`, and `prisma/schema.prisma`.
- **Stays in frontend:** SEO (the graph shows `siteConfig`, `buildMetadata`, `breadcrumbList`, `JsonLd` as the most-connected nodes in the app — that's a rendering concern and it belongs where rendering happens), layout, components, and the pure presentational helpers (`calendarLinks.ts` builds "Add to Google Calendar" URLs; blog `readingTime`/`tableOfContents` run at render time).
- **Becomes a shared package:** the wire contract. See below.

**The frontend does not lose its shape.** Above `container.ts`, nothing changes. Server Actions keep calling `bookingContainer.createBooking(...)`; the container's implementation stops being `createBookingUseCase(deps, …)` and becomes an HTTP call that returns the same `Result<T>`. Components, forms, and error handling are untouched. That is the whole point of the port boundary the frontend already built — this migration is the thing it was designed for.

### `packages/contracts` — one definition, three consumers

```
alls/
├── packages/contracts/     # Zod schemas → types + validation + OpenAPI
├── backend/
├── frontend/
└── template/               # reference only, not built
```

The frontend already validates the booking form with Zod (`application/booking/validation.ts`). The backend must validate the same payload — it can never trust the client. Define it once:

- **Backend** uses the schema in a global `ZodValidationPipe` (authoritative check at the boundary).
- **Backend** generates Swagger *from* the same schema (`nestjs-zod` + `zod-to-openapi`).
- **Frontend** imports it for instant client-side field errors, and infers its TypeScript types from it.

One source of truth flows to validation, docs, and types. The alternative — NestJS's default `class-validator` — would mean maintaining a second copy of every schema alongside the frontend's existing Zod ones. That is the exact drift we're eliminating. This is why the brief's "Zod where appropriate" is right here, and "appropriate" means *at every boundary*.

Workspace tooling: npm or pnpm workspaces. Nothing heavier — no Nx/Turbo until build times justify them.

> **If you overturn this decision**, overturn it now, not in month three. Everything below assumes the backend owns the domain. If the firm decides the marketing site keeps booking permanently, sections 6–9 change shape substantially.

---

## 1. Folder structure

```
backend/
├── prisma/
│   ├── schema.prisma            # moved from frontend/prisma — already reviewed
│   ├── migrations/              # incl. raw-SQL migrations Prisma can't express
│   └── seed.ts                  # from frontend/src/data/*.ts
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── config/                  # Zod-validated env, typed ConfigService
│   ├── common/                  # filters, interceptors, guards, decorators, pipes
│   ├── domain/                  # ← moved. Pure TS. Zero framework imports.
│   │   ├── booking/  scheduling/  blog/  reviews/  team/
│   │   └── matters/  documents/  identity/            (future)
│   ├── modules/
│   │   ├── booking/  catalog/  content/  reviews/  enquiries/
│   │   ├── identity/  portal/  matters/  documents/
│   │   ├── notifications/  calendar/  payments/  audit/  analytics/
│   ├── infrastructure/          # prisma, redis, storage, email, sms clients
│   └── jobs/                    # BullMQ processors
├── test/
├── Dockerfile
└── docker-compose.yml
```

Each feature module has the same internal shape — the one the frontend already uses:

```
modules/booking/
├── booking.module.ts     # the composition root (this replaces container.ts)
├── api/                  # controllers, HTTP mapping, Swagger decorators
├── application/          # use cases
├── ports/                # interfaces  (moved from application/booking/ports.ts)
└── adapters/             # PrismaBookingRepository, ResendNotificationService, …
```

**Why this shape:** it is the shape the codebase already has. `container.ts` says it's "the ONLY file allowed to import both a use case and a concrete adapter" — that is precisely what a NestJS module's `providers` array is. **NestJS's DI container *is* the composition root.** The `deps` object becomes constructor injection; ports become injection tokens. The pattern is unchanged; only the wiring mechanism changes. That's why the use cases move near-verbatim instead of being rewritten.

**The one rule that matters:** `domain/` imports nothing — no NestJS, no Prisma, no Zod. It is pure functions and types. Dependencies point inward: `api → application → ports ← adapters`. If you ever find `@Injectable()` in `domain/`, the boundary has leaked and the unit tests get slow.

**Use cases as `@Injectable()` classes**, one per use case, constructor-injecting port tokens — rather than keeping the current `createBooking(deps, input)` free-function style. Why: it's the idiom the team will expect, and the conversion is mechanical *because* the deps are already explicit and injected. It costs nothing in testability — you still `new CreateBookingUseCase(fakeRepo, fakeClock)` in a unit test without Nest's harness.

---

## 2. Module architecture

A **modular monolith**. One deployable API, one deployable worker, hard internal boundaries.

**Why not microservices.** A UK law firm's website and portal will not be traffic-bound in the next five years. The constraints here are *correctness* and *compliance*, and distributed systems make both harder: cross-service transactions, eventual consistency in an audit trail, five deploy pipelines. The module boundaries + ports below give you the option to split later at near-zero cost, when a real reason appears (`documents` needing separate scaling or a separate security zone is the likeliest). Build the seam; don't cut it yet.

**Modules and why they're drawn there:**

| Module | Owns | Boundary rationale |
|---|---|---|
| `catalog` | services, solicitors, offices | Read-heavy, public, cacheable. Written only by admin/CMS. |
| `booking` | bookings, availability | The only module needing strong write consistency. |
| `content` | blog, FAQs, practice areas, homepage | Editor-written, public-read, triggers ISR revalidation. |
| `reviews` | reviews, video testimonials | Public read; future client submission. |
| `enquiries` | contact form submissions | Trivial now; becomes CRM-shaped later. |
| `identity` | users, roles, sessions, MFA | Security-critical. Isolated so its blast radius is bounded. |
| `portal` | client-facing views | Different principal, different threat model. |
| `matters` | cases, assignments | Confidential. Strictest controls. |
| `documents` | uploads, versions, AV state | Confidential + large binaries + async pipeline. Most likely future split. |
| `notifications` | email/SMS routing, templates, delivery | Shared by everything. |
| `calendar` | Google/Outlook sync | Isolated because OAuth tokens are high-value secrets. |
| `payments` | Stripe integration, receipts | Isolated for PCI scope and SRA client-money rules. |
| `audit` | append-only audit log | Written by all; readable by few. |
| `analytics` | aggregates, reporting | Read-only over others' data; never on the hot path. |

**Rules between modules:**

1. **A module owns its tables.** No cross-module Prisma queries. If `booking` needs a solicitor, it asks `catalog`'s service — it does not `prisma.solicitor.findMany()`. This is the seam. Violate it and the future split becomes a rewrite.
2. **Side effects go through events, not calls.** `booking` must not import `audit` or `notifications`. It emits `BookingConfirmed`; the audit and notification modules subscribe. Why: otherwise every new cross-cutting concern edits every use case, and `createBooking` slowly accumulates six unrelated responsibilities.
3. **Shared kernel is `domain/` only**, and it's pure.

Global/infrastructure modules: `ConfigModule`, `PrismaModule`, `RedisModule`, `QueueModule`, `StorageModule`, `AuditModule`, `NotificationsModule`.

---

## 3. API architecture

**REST + OpenAPI. Not GraphQL.**

Why: the frontend is server-rendered and fetches on the server, so GraphQL's core win — letting a client shape its own query to avoid over-fetching over a slow mobile link — mostly doesn't apply when you control both ends and the fetch happens in a datacenter. Against that, REST gives simpler per-route auth and rate limiting, HTTP caching that aligns with Next's caching model, and Swagger generated free from the Zod contracts. Revisit if a third-party API or a mobile app with divergent needs appears.

**Three surfaces, deliberately separate:**

| Surface | Principal | Auth | Cache | Rate limit |
|---|---|---|---|---|
| `/api/v1/public/*` | anonymous / manage-token | none or capability token | aggressive, CDN-able | strict per-IP |
| `/api/v1/portal/*` | client | JWT, matter-scoped | none | moderate per-account |
| `/api/v1/admin/*` | staff | JWT + MFA + RBAC | none | moderate, IP-allowlistable |

Why split rather than one namespace with different guards: they have genuinely different threat models, cache policies, and rate limits, and someday different WAF rules or even different deployments. Baking the split into the URL now means that change is free later and no route gets renamed.

**Versioning:** URI (`/api/v1`), via Nest's `enableVersioning`. Chosen over header versioning because it's visible in logs, trivially cacheable, and debuggable with curl.

**Error responses: RFC 9457 Problem Details** (`application/problem+json`), carrying the **existing `DomainError.code` unchanged**:

```
{ "type": "...", "title": "...", "status": 409,
  "code": "SLOT_NO_LONGER_AVAILABLE",
  "detail": "...", "fieldErrors": {...}, "traceId": "..." }
```

The `code` is already the frontend's contract. Do not invent a new taxonomy — the frontend switches on these codes today and must keep working.

**Idempotency:** `Idempotency-Key` header required on `POST /bookings` and all payment mutations. Users double-click; networks retry. Store key → response in Redis with a 24h TTL and replay the stored response on a repeat.

**Pagination:** cursor-based for anything unbounded (bookings, audit logs, documents). **Offset for the blog** — the frontend already does `?page=N` (`parsePage`) and those URLs are indexed by Google; cursor pagination would break deep links and SEO. Match the medium to the need rather than applying one rule everywhere.

**Also:** `/health/live` + `/health/ready` (Terminus), `x-request-id` correlation propagated in and out, `Retry-After` on 429/503.

---

## 4. Authentication strategy

**Three principals, three mechanisms.** Conflating them is how portals leak.

### 4.1 Anonymous + capability token (public booking)

The existing `manageToken` is already an authentication mechanism — a bearer capability in a URL. It should be treated as one:

- **Hash it at rest.** Today it would be stored plaintext; a DB dump is then a set of live credentials to every booking. Store `SHA-256(token)` and look up by hash — deterministic, so it stays indexable. (SHA-256, not bcrypt/Argon2: you need to *find* the row by the token; and the token is already 256 bits of CSPRNG entropy, so it isn't brute-forcible the way a human password is.)
- **Constant-time compare**, uniform 404 on miss (never reveal existence), rate-limit lookups to kill enumeration.
- **Expire it** — appointment end + cancellation window. A capability that lives forever is a liability.

### 4.2 Staff (solicitors, admins, editors)

- **Argon2id** password hashing (memory-hard; bcrypt acceptable, but Argon2id is the current recommendation).
- **MFA (TOTP) mandatory.** Not optional — these accounts reach privileged client data. A phished password must not be sufficient.
- Progressive lockout via Redis counters; breached-password check against HIBP's k-anonymity range API at set-time.

### 4.3 Clients (portal)

Password + optional TOTP, or magic-link. Magic-link is worth considering: clients log in rarely, and a rarely-used password is a reused password.

### Token design (all authenticated principals)

- **Access token:** JWT, **RS256**, 15-minute TTL, claims `sub`/`role`/`sid`/`jti`. Asymmetric over HS256 so a gateway or future service can *verify* without holding the *signing* key — key separation you'll want and can't retrofit cheaply.
- **Refresh token:** opaque random, **stored hashed**, rotating, with **reuse detection** — if an already-consumed refresh token is presented, that's a theft signal: revoke the entire token family and force re-auth.
- **Transport:** refresh in `httpOnly; Secure; SameSite=Lax`, path-scoped to `/api/v1/auth/refresh`. Not localStorage — an XSS can read localStorage and exfiltrate a long-lived credential; it cannot read an httpOnly cookie.
- **Revocation:** 15-minute access TTL bounds revocation lag. For immediate kill (staff termination, stolen device), the guard checks a Redis denylist of revoked `sid`s. Trade-off: one Redis hit per request — acceptable, it's a cache hit, and "we can't revoke access for 15 minutes" is not an acceptable answer for a firm holding privileged data.

---

## 5. Authorization strategy

**RBAC alone is insufficient here, and that's the important part.**

Roles: `SUPER_ADMIN`, `FIRM_ADMIN`, `SOLICITOR`, `PARALEGAL`, `RECEPTIONIST`, `EDITOR`, `CLIENT`.

Guards check **permissions**, not roles (`matter:read`, `document:download`, `content:publish`, `audit:read`). Roles map to permission sets. Why: adding a role shouldn't require touching every guard, and `if (role === 'ADMIN' || role === 'SUPER_ADMIN' || …)` is how authorization bugs are born.

**But the real requirement is resource scoping.** A `SOLICITOR` may read matters *they are assigned to* — not every matter in the firm. A `CLIENT` may read *their own* matter. No role check expresses that.

**Use CASL** (`@casl/ability`) — define abilities per user with conditions, and **push those conditions into the Prisma `where` clause**:

```
// conceptually
ability.can('read', 'Matter', { assignedSolicitorIds: { has: user.id } })
   → prisma.matter.findMany({ where: accessibleBy(ability).Matter })
```

This is the single highest-value decision in this section. **Authorization becomes a query predicate rather than a post-fetch check** — which structurally prevents IDOR, the most common and most damaging bug class in a portal. `findUnique({ id })` followed by an `if` is one forgotten `if` away from serving another client's case file.

**Scope dimensions:** model grants as `(role, scope)` where scope ∈ `global | office:{id} | matter:{id}`. This is also the **multi-office** hook — an office-scoped `FIRM_ADMIN` falls out of the same mechanism rather than needing a new one.

**Deny by default:** a global guard, opt out explicitly with `@Public()`. Forgetting to add a guard must fail *closed*. (See §14 for a live example of a fail-*open* check in the current codebase.)

**Law-firm-specific, surfacing with case management:** conflict-of-interest checks (the firm may not act for both sides) and information barriers between matter teams are authorization rules with no equivalent in a normal SaaS app. They're out of scope for phase one but they are why the policy layer must be data-driven from day one — they cannot be bolted onto hardcoded role checks.

---

## 6. Database strategy

**PostgreSQL + Prisma. Start from `frontend/prisma/schema.prisma` — move it, don't rewrite it.** It's already reviewed and matches the domain field-for-field. Rewriting it would discard work and re-introduce drift.

**Data residency: UK/EU region** (AWS `eu-west-2` London, or Azure UK South). Client expectation and a straightforward answer to a due-diligence questionnaire. Confirm with the firm's DPO before committing.

### The concurrency guard — with a correction

`prisma/README.md` correctly identifies the fix for `createIfSlotFree`: an `EXCLUDE` constraint using `btree_gist` over `(solicitor_slug, tstzrange(slot_start_utc, slot_end_utc))`, as a raw-SQL migration (Prisma can't express `EXCLUDE`). That's right — an application-level check cannot make double-booking impossible under concurrency; only the database can.

**It needs one addition the README omits: a `WHERE status = 'CONFIRMED'` predicate.** Without it, a *cancelled* booking permanently blocks its slot — nobody can ever rebook a cancelled appointment. The constraint must be partial:

```sql
ALTER TABLE "Booking" ADD CONSTRAINT booking_no_overlap
  EXCLUDE USING gist (
    "solicitorSlug" WITH =,
    tstzrange("slotStartUtc", "slotEndUtc") WITH &&
  ) WHERE (status = 'CONFIRMED');
```

`rescheduleIfSlotFree` relies on the same constraint: attempt the `UPDATE`, catch the violation, return `false` — exactly as the README describes.

### Other choices

- **IDs: UUIDv7.** Time-sortable (index locality, unlike v4's random scatter) and unguessable (unlike sequential ints). The domain already flags this: *"never the booking id (which may be sequential/guessable in a future DB)"*. v7 honours that intent and makes the concern moot.
- **Timestamps: `timestamptz`, always UTC**, with `displayTimeZone` stored separately. The domain already does this correctly (`slotStartUtc` + `displayTimeZone`) — it's the right model and multi-office/multi-timezone depends on it. Don't "simplify" it.
- **Migrations:** `prisma migrate` for schema, raw SQL for extensions (`btree_gist`) and the `EXCLUDE` constraint. **Expand/contract** always (§17).
- **Encryption:** disk/RDS encryption *plus* application-level envelope encryption (KMS-managed DEK, AES-GCM) for special-category fields — matter notes, document metadata, and `clientNotes` (a free-text box a stranger types into; assume it contains something sensitive, because eventually it will). Why both: disk encryption protects a stolen disk. It does nothing about a SQL injection, an over-permissive read replica, or a leaked backup — and those are the realistic breach paths.
- **Retention vs. erasure — name the conflict now.** Solicitors must retain matter files for years (commonly 6–15 depending on matter type; **confirm with the firm's COLP**). GDPR's right to erasure does not override a legal retention duty — but it *does* apply to data not under one, such as a marketing enquiry from someone who never became a client. So: soft delete (`deletedAt`) plus an explicit, per-entity **retention schedule** and a disposal job. Do not build "delete everything about this person" as one button; build it as a policy table.
- **Audit tables:** separate schema, append-only, and the application DB role holds **no `UPDATE`/`DELETE` grant** on them. Enforce at the database, not in code — an audit log the app can rewrite isn't evidence.
- **Pooling:** PgBouncer (transaction mode) in front of RDS. Less acute than on serverless since the backend is long-running, but Prisma + Lambda-style pooling pain is a known trap worth avoiding structurally.
- **Not multi-tenant.** One firm. Multi-*office* is a scope column, not a tenancy model. Don't pay the multi-tenancy tax for a requirement nobody has.

---

## 7. File storage strategy

**Documents never go in Postgres.** Object storage, behind a port.

```
StoragePort: putSigned(key, constraints) | getSigned(key, ttl) | delete(key) | head(key)
```

Adapters: **S3** (prod, `eu-west-2`, SSE-KMS), **MinIO** (local dev, in docker-compose), Azure Blob if sovereignty demands move. The abstraction is cheap and the firm's hosting requirements are exactly the kind of thing that changes after a client security review.

### Upload flow — and why it's shaped like this

Uploads go **direct to storage via pre-signed PUT URLs**; the API never proxies the bytes. Why: a 200MB scanned bundle through a Node process means memory pressure, request timeouts, and paying for the transfer twice.

But a pre-signed PUT means **the file lands without passing through your code** — so validation has to happen on the other side:

1. Backend issues a **short-TTL (≈5 min) pre-signed PUT**, scoped to one key, with content-length and content-type constraints. `Document` row created as `PENDING`.
2. File lands in a **private quarantine bucket**.
3. S3 event → BullMQ `documents` job → **ClamAV scan** + **magic-byte type sniffing** (never trust the extension or the client's `Content-Type`) + size check.
4. Pass → copy to the **clean bucket**, mark `AVAILABLE`. Fail → mark `REJECTED`, alert, never move it.
5. Download → **CASL check first**, then a short-TTL pre-signed GET. Never a public URL, never a permanent one.

AV scanning is not optional for a portal that accepts uploads from the public internet — it is the single most obvious attack path into a law firm, and "we forward the file to a solicitor's laptop" is the whole point of the feature.

**Keys:** `matters/{matterId}/{documentId}/{version}` — **never** a user-supplied filename in the key (path traversal, collisions, encoding bugs). Store the original filename as metadata and set it in `Content-Disposition` on download.

**Also:** bucket-level public access block, versioning on, **Object Lock (WORM)** for anything under legal hold or a tamper-evidence requirement.

---

## 8. Queue architecture

**BullMQ on Redis. Workers in a separate container from the API**, same image, different entrypoint (`APP_ROLE=worker`).

Why separate processes: a ClamAV scan or a 500-recipient send must not compete with HTTP request handling for the event loop, and API and worker scale on completely different signals. Same image: one build artifact, so the code that ran in CI is byte-identical to the code in both roles.

**Queues, split by SLA and failure domain:** `email`, `sms`, `documents`, `calendar-sync`, `reminders`, `webhooks`, `cms-revalidate`, `analytics`. Why not one queue: a wedged calendar-sync job must not delay a booking confirmation, and each queue wants its own concurrency, retry policy, and rate limit (Resend and Twilio have very different quotas).

**Reliability:**

- **Idempotent jobs, natural-key `jobId`** (`reminder:{bookingId}`) → BullMQ dedupes for free.
- **Retries:** exponential backoff, capped attempts, then a DLQ that **alerts**. A silent DLQ is a data-loss bug with extra steps.
- **Transactional outbox for must-not-lose effects.** A DB commit and a Redis enqueue are two systems; a crash between them silently loses the confirmation email. Write an `outbox_events` row *in the same transaction* as the booking; a relay polls and enqueues.
  This preserves the existing intent exactly — `createBooking`'s comment says *"Notification failures must never undo an already-persisted booking"*, and the code fires `void Promise.all([...])` deliberately. The outbox keeps that (the booking still commits regardless) **and** guarantees the email eventually sends. Worth the added relay: a missed confirmation is a client who doesn't show up, or shows up when nobody's expecting them.

### Reminders: replace the cron endpoint

`/api/cron/reminders` exists because serverless has no long-running process. **The backend is a long-running process**, so reminders become a BullMQ **repeatable job** (hourly). Real benefit beyond tidiness: BullMQ coordinates repeatables through Redis, so N API replicas fire the job **once**, cluster-wide. The current design would send N reminders if you ran three Next instances with three crons.

**One correction carried over.** `sendDueReminders` today does `findDueForReminder()` → `send()` → `save(reminderSentAt)`. That's a read-modify-write with no claim: two workers polling concurrently both see the same booking as due and both email the client. Fix by **claiming before sending**:

```sql
UPDATE "Booking" SET "reminderSentAt" = now()
WHERE id = $1 AND "reminderSentAt" IS NULL
RETURNING *;
```

Zero rows → someone else claimed it, skip. Claim-then-send yields at-least-once delivery and never a double. (Failure mode becomes "claimed but send failed" → the job retries and the DLQ catches it; that's the right trade — a client would rather miss a reminder than get five.)

**Also:** per-queue rate limiters for provider quotas; Bull Board mounted behind admin auth.

---

## 9. Notification architecture

**Keep the existing port.** `NotificationService.send(EmailMessage)` is already right, and the comment explains why: *"deliberately just 'send an email' — composition happens in emailComposer.ts, so this port is trivially swappable."* That judgement holds. Generalise around it rather than replacing it.

**Layers:**

1. **Trigger** — a use case emits a domain event (`BookingConfirmed`). It does not know about channels.
2. **Router/policy** — decides channels + recipients, checks preferences and **consent**.
3. **Render** — `emailComposer.ts` (moved as-is; React Email or MJML if templates get richer). Keeps producing the `.ics` attachment it already produces.
4. **Transport** — `EmailChannel` (Resend prod / SMTP fallback / Mailpit dev), `SmsChannel` (Twilio), future `PushChannel`.
5. **Track** — provider webhooks → `notification_deliveries` (sent/delivered/bounced/complained). Without this "did the client get it?" is unanswerable, and for a missed appointment that question gets asked.

**UK consent rules — a real constraint, not boilerplate:**

- **Transactional** (booking confirmation, reminder, password reset) — contract/legitimate interest, no consent needed.
- **Marketing** (newsletter, "we now do conveyancing!") — **PECR requires consent**, with opt-out in every message and honoured `STOP` for SMS.
- These must be **separate consent flags with separate storage**, because the compliance answer differs. Conflating them into one `emailOptIn` is how firms end up ICO-reportable.
- **Never put matter detail in an SMS.** Unencrypted, sits on a lock screen, often synced to a family tablet. "You have an appointment tomorrow at 2pm" — never why.

**Dev safety:** Mailpit in docker-compose, plus a **non-prod recipient allowlist** — in any environment that isn't production, drop or redirect mail to non-allowlisted domains. This is the guard that stops a staging seed run from emailing 400 real clients. Cheap, and the failure it prevents is unrecoverable.

---

## 10. Logging strategy

**Structured JSON via pino** (`nestjs-pino`). Fast, JSON-native, good Nest integration.

**Correlation:** accept or generate `x-request-id`, carry it through **AsyncLocalStorage** into every log line, and **into job payloads** — so a worker's logs link back to the request that queued it. Without that, debugging an async pipeline is archaeology.

### Application logs ≠ audit logs

These get conflated constantly, and they have opposite requirements:

| | Application log | Audit log |
|---|---|---|
| Purpose | Debugging | Legal/regulatory record |
| Store | Log platform (OTel → Loki/Datadog) | Postgres, append-only |
| Retention | ~30 days | Years (per retention schedule) |
| Content | **Aggressively redacted** | Complete, never redacted |
| Lossy? | Acceptable | Never |

**Redaction is mandatory** in application logs: pino `redact` on `authorization`, `cookie`, `password`, `clientEmail`, `clientPhone`, `clientNotes`, tokens, document filenames. Default to logging **IDs, not payloads**. A law firm spilling privileged content into a third-party log platform is a reportable breach — and log platforms are exactly where nobody looks for PII until an auditor does.

**Audit events:** authentication (success, failure, MFA, reset), permission changes, content publish, admin actions, data export, and — **including reads** — every access to a matter or document. Read-auditing is unusual outside regulated contexts; here "who viewed this file, and when" is precisely the question that gets asked. Fields: actor, action, resource, timestamp, IP, user-agent, outcome.

**Also:** OpenTelemetry traces spanning API → queue → worker; RED metrics plus business metrics (bookings/day, availability lookups, DLQ depth); **Sentry** for exceptions with PII scrubbing — honouring the existing comment: *"a production deploy would also push this to error tracking (Sentry, etc.) rather than just console.error."* Confirm your log/APM processor is UK/EU-hosted with a DPA signed.

---

## 11. Error handling

**Preserve the existing error model.** `DomainError` with stable `code` is already the frontend's contract; it moves to the backend unchanged.

**Flow:** use cases keep returning `Result<T>` internally → the controller maps `Result` → HTTP. A global `AllExceptionsFilter` catches everything else. This means **zero rewrite of the use cases** — the `Result` envelope keeps doing its job on the server side, and the HTTP mapping is a thin edge concern.

**Code → status map** (the codes already exist in `domain/booking/errors.ts`):

| Code | Status | Why |
|---|---|---|
| `VALIDATION_FAILED` | 400 | with `fieldErrors` |
| `SPAM_REJECTED` | 422 | |
| `RATE_LIMITED` | 429 | + `Retry-After` |
| `SLOT_NO_LONGER_AVAILABLE` | **409** | Conflict — semantically exact |
| `OUTSIDE_NOTICE_WINDOW` / `OUTSIDE_BOOKING_WINDOW` | 422 | Well-formed, violates policy |
| not found | 404 | uniform; never distinguish "missing" from "not yours" |
| authn / authz | 401 / 403 | |
| unknown | 500 | `{ code: "INTERNAL", traceId }` only |

**Never leak internals.** An unexpected exception returns a `traceId` and nothing else; the stack goes to the logs. The `traceId` is what a user quotes to support and what ties their complaint to the exact request.

**Client-safe messages.** The existing code already gets this right — *"Please check the highlighted fields."*, not a Prisma error string.

**On the frontend:** the typed client maps `problem+json` back into `Result<T>`. Components keep their existing `if (!result.ok) switch (result.error.code)` logic verbatim. **The migration is invisible above the container** — which is the payoff for the port boundary the frontend already built.

---

## 12. Validation strategy

**Zod, defined once in `packages/contracts`** (see §0), driving validation + Swagger + frontend types.

Why not `class-validator` (the Nest default): the frontend already has Zod schemas the booking wizard uses. Choosing class-validator means two schemas for one payload, maintained by two people, drifting silently until the form accepts something the API rejects. Single source of truth wins over framework convention here.

**Three layers, and all three are load-bearing:**

1. **Syntactic** — Zod at the boundary. Shape, type, format, length, coercion. Global `ZodValidationPipe`; controllers receive parsed, typed data.
2. **Semantic** — in the use case. *"Is this slot within the 24h notice window?"*, *"does this solicitor offer this service?"* Needs data and policy; not expressible in a schema. Already lives in `createBooking` + `resolveContext` — leave it there.
3. **Integrity** — database constraints. FKs, uniques, the `EXCLUDE` constraint.

Why all three: **Zod cannot know the slot was taken two milliseconds ago. The database cannot produce a friendly field error.** Each layer catches what the others structurally can't, and the DB is the only one that holds under concurrency.

**One fix to the existing design.** `SpamCheckInput.renderedAtMs` is **client-supplied and unsigned** — the "too fast" check is bypassed by posting any timestamp you like. It's a heuristic, not a control, and the current code is honest about being heuristic. Harden it cheaply: **HMAC-sign the render timestamp server-side** and verify the signature on submit. Same UX, same port shape, but the timing signal can no longer be trivially forged. (The honeypot and rate limit are unaffected — and per §13 the rate limiter must move to Redis anyway.)

**Also:** validate file uploads by magic bytes, never `Content-Type`. Snapshot the generated OpenAPI doc in CI so a breaking contract change is visible in review rather than at runtime.

---

## 13. Security strategy

**Threat model first.** The crown jewels are **privileged client data**. A breach is simultaneously an ICO notification (72 hours where there's risk to individuals), an SRA reporting question, and a potential legal-professional-privilege problem. Design accordingly: this is not a generic CRUD app's risk profile.

| Area | Decision |
|---|---|
| Transport | TLS 1.2+, HSTS with preload |
| Headers | helmet; strict CSP — note the frontend's `JsonLd` emits inline `<script type="application/ld+json">`, so CSP needs nonces, not `unsafe-inline` |
| CORS | exact-origin allowlist; credentials only on portal/admin |
| CSRF | `SameSite=Lax` covers most; double-submit token on the refresh-cookie route. Bearer-token routes are CSRF-immune |
| Rate limiting | `@nestjs/throttler` **with Redis storage** — the current `InMemoryRateLimiter` is per-process (the README flags this): across N replicas "5 per 15 min" silently becomes 5N. Tiered: global per-IP, strict per-route (login 5/15min, booking create 5/15min, password reset), plus per-account lockout |
| Proxy | trust-proxy configured correctly or every rate limit keys off the load balancer's IP and limits the whole internet as one user. The frontend's `clientIp()` helper has this logic — carry it over |
| Secrets | AWS Secrets Manager / Vault, injected at runtime. `.env` for local only; `.env.example` committed, `.env` gitignored. Rotate |
| SQLi | Prisma parameterises; audit every `$queryRaw` for tagged-template usage |
| **IDOR** | **The #1 risk.** CASL conditions pushed into the Prisma `where` (§5). Never fetch-then-check |
| Manage token | hashed at rest, constant-time compare, expiring, lookup-rate-limited, uniform 404 (§4.1) |
| Dependencies | Renovate/Dependabot, `npm audit` gating CI, SBOM, lockfile check |
| Images | Trivy scan in CI, base image pinned by digest |
| Backups | encrypted, access-controlled, **restore-tested**. A backup is a full copy of the crown jewels and deserves production-grade controls |
| Staff access | MFA mandatory; optional IP allowlist for `/admin` |

**Data protection workstream (not optional, and not just paperwork):**

- **DPIA before the client portal ships.** Large-scale processing of confidential — likely special-category (Art. 9) and criminal-offence (Art. 10) — data. This is very likely legally required, and it will change the design, so do it *before* building, not after.
- ICO registration; DPAs with every processor (AWS, Resend, Twilio, Stripe, your log platform); a maintained sub-processor list; retention schedule (§6); a rehearsed 72-hour breach runbook.
- **Legal professional privilege:** assess whether privileged material should sit with processors outside the UK. This is a legal judgement, not an engineering one — raise it with the COLP; don't decide it in a PR.
- **Honour cookie consent server-side too.** The frontend already has a full consent implementation (`CookieConsentBanner`, `useCookieConsent`). Analytics events fired from the backend must respect the same choice, or the banner is theatre.

- **Pen test before the portal goes live.** Not after.

---

## 14. Environment management

**12-factor config, validated at boot with Zod.** `ConfigModule` parses `process.env` against a schema at startup and **crashes loudly on a miss**. Typed `ConfigService` everywhere; no bare `process.env` reads outside `config/`.

**Why boot-time validation, concretely.** Look at the current cron route:

```ts
const secret = process.env.CRON_SECRET;
if (secret) {                       // ← if the secret is UNSET, auth is SKIPPED
  if (auth !== `Bearer ${secret}`) return 401;
}
```

A missing `CRON_SECRET` doesn't fail — it makes the endpoint **public**. That's fail-open, and it's exactly the class of bug boot-time validation eliminates: the container refuses to start rather than starting insecure. Same for a missing `RESEND_API_KEY` — better a failed deploy than silently dropping every confirmation email for a week. **Fail closed, fail loud, fail at deploy.**

**Environments:** `local` → `ci` → `staging` → `production`. Separate secrets per environment; never shared.

**Hard rule: production data never goes to staging.** It's privileged client data — copying it into a lower-trust environment is a disclosure, regardless of intent. Staging gets synthetic seed data (the existing `src/data/*.ts` files are a ready-made, realistic, entirely fake seed — keep them for exactly this).

**Feature flags** for the future features (portal, payments, AI). Ship dark, enable per environment.

`.env.example` lists every variable with a description and whether it's required.

---

## 15. Docker architecture

**Multi-stage build:** `deps` → `build` → `runtime`. `node:22-slim` or distroless. Copy `package.json` + lockfile first for layer caching. `.dockerignore` everything else.

**Runtime hardening:** non-root user, read-only root filesystem, dropped capabilities, no shell in the production image.

**One image, two roles.** API and worker share the image, differ by `APP_ROLE=api|worker`. Guarantees the worker runs the exact bytes CI tested, and halves the build matrix.

**`docker-compose.yml` for local:** postgres, redis, minio, mailpit, api, worker, bull-board. One command to onboard, and dev has the same service topology as prod — so "works locally" means something.

**Migrations run as a separate deploy step, never on app start.** Why: N replicas booting = N concurrent `migrate deploy` = lock contention and races, and a bad migration would crash-loop every pod instead of failing one job you can read the logs of.

**Probes — and don't conflate them:** *readiness* = DB + Redis reachable (pull me out of the load balancer); *liveness* = process alive. If a DB blip fails your liveness probe, the orchestrator kills healthy pods during the exact incident you needed them for.

**Graceful shutdown:** `app.enableShutdownHooks()`; on SIGTERM stop accepting connections, drain in-flight requests, and **close BullMQ workers cleanly** so running jobs finish rather than getting killed mid-send and retried.

---

## 16. Testing strategy

**The existing dev adapters are the test doubles.** `InMemoryBookingRepository`, `Static*Repository`, `ConsoleNotificationService` were written as development adapters — they are already perfect fakes. Move them to test fixtures; don't delete them and don't write mocks to replace them. Likewise the `Clock` port: inject a `FixedClock` and every time-dependent rule (notice window, cancellation window, reminder lead) becomes deterministic. The hexagonal design already paid for this; collect it.

| Layer | What | Tooling |
|---|---|---|
| **Unit** (most) | `domain/` — pure: policy, availability, timezone, ics, reading-time. Use cases against fake ports | Vitest/Jest, no Nest harness |
| **Integration** | Adapters against **real** Postgres + Redis | **Testcontainers** |
| **Contract** | OpenAPI snapshot diffed in CI | zod-to-openapi |
| **E2E** | Nest app + Testcontainers, happy paths + authz | supertest |

**Why a real database, not a mocked Prisma:** the things worth testing in an adapter *are* the database's behaviour — the `EXCLUDE` constraint, transaction semantics, cascade rules. A mocked Prisma asserts that you called the method you called. It tests nothing.

**The one test the booking system must have:**

> Fire N concurrent `createBooking` calls for the same solicitor and slot. Assert **exactly one** succeeds and the rest get `SLOT_NO_LONGER_AVAILABLE`.

This is the correctness claim the whole design rests on, and it can only be written against a real Postgres with the real constraint. If this test doesn't exist, the `EXCLUDE` constraint is a comment.

**Mandate an authz matrix test:** table-driven over (role × resource × action), including the negative cases. Every new endpoint adds a row. For a firm holding privileged files, "we forgot to test that a client can't read another client's matter" is not a survivable sentence. Add an IDOR regression test for each resource.

**Coverage:** high bar on `domain/` and `application/` (the rules); no vanity target on adapters and controllers. Chasing 100% produces tests that assert the code says what it says.

**CI:** lint → typecheck → unit → integration → OpenAPI diff → build → image scan → Prisma schema-drift check.

---

## 17. Deployment strategy

**AWS ECS Fargate, `eu-west-2` (London).** RDS Postgres Multi-AZ, ElastiCache Redis, S3, Secrets Manager, KMS, ALB + WAF.

Why Fargate over EKS: there is no cluster to operate, and Kubernetes for one API and one worker is a full-time job the firm isn't hiring for. Why not Fly/Railway: RDS/KMS/S3/IAM integration and a UK region matter more here than developer ergonomics. Revisit at genuine scale — which, honestly, is unlikely to arrive (see §18).

**Frontend hosting — a nuance worth stating.** The marketing site should stay on Vercel: it's Next, and ISR/edge rendering are exactly Vercel's strengths, and no client data is involved. **The portal is a different question.** Rendering privileged matter data through a US-headquartered edge network deserves a deliberate decision with a DPA and an assessment behind it — not a default. Recommendation: marketing on Vercel; portal rendered from UK infrastructure (or same-cloud Next). Raise it with the COLP.

**Pipeline:** GitHub Actions → build → scan → push ECR → deploy staging → smoke tests → manual approval → production.

**Deploy style:** blue/green (CodeDeploy). Instant rollback, and it composes with the migration rule below.

**Migrations: expand/contract, always.** Rolling and blue/green deploys both mean old and new code run *simultaneously*. A destructive migration breaks the old version mid-deploy. So: add nullable column → deploy code writing both → backfill → deploy code reading new → **drop old in a later release**. Never destructive in the same release as the code that stops using it. This is also what makes rollback real: rolling code back is easy, rolling a dropped column back is not.

**Backups & DR:** RDS PITR (35d), snapshot retention per the §6 schedule, cross-region copy staying in UK/EU. Target RPO ≤ 5 min, RTO ≤ 4 h. **Quarterly restore drills** — an untested backup is a hypothesis.

**Before launch:** observability wired, with alerts on 5xx rate, queue depth, **DLQ non-empty**, failed-login spikes, certificate expiry, connection-pool saturation. Runbooks for the top five incidents. A status page and an on-call rota once clients depend on the portal.

---

## 18. Future scalability

**Be honest about the constraint: this system will not be traffic-bound.** A UK law firm's site and portal is a low-thousands-of-users problem. The binding constraints are **correctness, confidentiality, and compliance**. Optimise the architecture for change and for auditability, not for throughput you'll never see. The scaling path below exists so nobody has to rediscover it — not because you'll need it soon.

**Scaling path, in the order it would actually happen:**
1. **Cache the hot reads.** Catalog and content in Redis + CDN. **Availability computation is the hot path** — cache per (solicitor, day), invalidate on booking write.
2. **Read replicas** for analytics and reporting, keeping them off the write path.
3. **Split a module out** — `documents` is the likeliest (different scaling shape, different security zone). The module boundary and ports (§2) are the seam; the outbox (§8) is already the integration mechanism. This is a week, not a rewrite — *if* rule 1 of §2 was honoured.
4. **Do not microservice this preemptively.** Modular monolith is correct at this size, and the option to split is the thing worth buying, not the split itself.

**Per future feature:**

| Feature | Design hook | The real difficulty |
|---|---|---|
| **Admin dashboard** | `admin` API surface + RBAC | None architectural — it's UI over existing use cases |
| **CMS** | `content` module | See below — a genuine fork |
| **Client portal** | `portal` surface + `identity` | Authorization (§5), not scale |
| **Case management** | `matters` module | Conflicts of interest, information barriers |
| **Documents** | `documents` + StoragePort | AV pipeline + authorization (§7) |
| **Email** | already designed (§9) | — |
| **SMS reminders** | `SmsChannel` adapter | PECR consent; never matter detail in a text |
| **Calendar sync** | the `CalendarSyncService` port `prisma/README.md` already predicted | Two-way sync is genuinely hard: conflict resolution, watch-channel renewal, reconciliation. OAuth refresh tokens are high-value secrets — encrypt at rest, isolate the module |
| **RBAC / audit** | §5, §10 | — |
| **Analytics** | `analytics` module, off the hot path | Must honour the existing cookie consent (§13) |
| **Payments** | `payments` module | See below |
| **Multi-office** | Already modelled — `Office.timeZone` exists, scope dimension in §5 | Mostly done by accident of a good existing design |
| **AI assistant** | See below | Privilege. Genuinely the riskiest item on the list |

### CMS: build or buy — an explicit fork

The content models are already known and typed (`src/data/*.ts`: posts, authors, categories, services, FAQs, testimonials, offices, solicitors). That's a small, well-understood domain.

- **Buy (Payload CMS)** — TS-native, self-hostable on Postgres, UK-hostable. Wins if editors need rich WYSIWYG, media library, draft preview, and publishing workflow. Costs: a second framework and its ops surface.
- **Build (`content` module)** — wins if editing is "change this FAQ, publish this post". Costs months if requirements grow into workflow.

**Recommendation: start with a `content` module**, because the models are small and already defined, and one stack is one thing to operate, patch, and audit. **Revisit the moment editors ask for draft preview or scheduled publishing** — that's the signal that you're rebuilding Payload badly.

**Either way, the piece people forget:** publishing must trigger **on-demand ISR revalidation** in Next (`revalidateTag`) via webhook. That's what keeps the site statically fast and SEO-strong while the content becomes dynamic. Without it you either lose SSG performance or serve stale content — and the graph shows how much of this frontend's value is in its SEO layer.

### Payments: two separate problems

1. **PCI.** Use Stripe Checkout or Elements. **The backend never touches card data** — that keeps you in the simplest PCI scope (SAQ-A territory; confirm with your acquirer). Webhooks with signature verification, idempotency, and replay handling.
2. **SRA Accounts Rules — the actual landmine.** Client money must be held in a designated client account, and money on account of costs, disbursements, and settled fees are *different things* under the rules. This is not a Stripe integration question; it's a compliance design question. **Design the payment flows with the firm's COFA before writing code.** Getting this wrong is a regulatory matter, not a bug.

### AI assistant: the highest-risk item

Split it in two, because the risk profiles are nothing alike:

- **Public FAQ bot — low risk, do this first.** RAG over *published CMS content only*. Physically separate index. No client data, by construction, not by policy.
- **Internal matter assistant — high risk.** Sending client matter text to a third-party LLM is a confidentiality and **legal-professional-privilege** question before it is an engineering one. Requires: a DPA, zero-retention terms, UK/EU processing, and a privilege assessment signed off by the COLP — or a self-hosted model. Never a consumer API.
- **Regulatory, both cases:** the assistant must not give legal advice. Reserved activities are regulated, and an LLM confidently telling a member of the public what to do about their case is a problem for the firm, not for the vendor. Hard disclaimers, narrow scope, human handoff.

---

## Suggested phasing

Ordered by risk retired per week, not by feature glamour.

| Phase | Scope | Exit criterion |
|---|---|---|
| **0** | Workspace + `packages/contracts`. Move `prisma/schema.prisma` to backend. Nest skeleton: config (Zod, fail-closed), logging, error filter, health, Docker, CI. | Empty API deploys to staging |
| **1** | Move `domain/` + `application/`. Prisma adapters. **`EXCLUDE` constraint + the concurrency test.** Redis rate limiter. Public API. Frontend containers → HTTP client. | Booking works end-to-end; concurrency test green; **no behaviour change visible to users** |
| **2** | Workers + BullMQ. Reminders as repeatable job (with the claim fix). Resend. Outbox. | Vercel cron deleted; reminders provably single-send |
| **3** | `identity` + RBAC/CASL + audit. Admin API. | Authz matrix test green; staff MFA enforced |
| **4** | `content` module + ISR revalidation. Admin dashboard. | Editors self-serve; site stays static-fast |
| **5** | **DPIA.** Portal + matters + documents + AV pipeline. Pen test. | Pen test clean; DPIA signed off |
| **6+** | Payments (with COFA), calendar sync, SMS, analytics, AI. | — |

**Phase 1's exit criterion is the important one: no user-visible change.** A migration that also ships features can't be rolled back cleanly, and can't be judged — if bookings break you won't know whether it was the move or the feature.

---

## Open questions for the firm

Engineering can't answer these, and they change the design:

1. **Data residency** — is UK-only processing required, or is EU acceptable? (Affects §17, and the Vercel-portal question.)
2. **Retention** — the actual schedule per matter type, from the COLP. (§6)
3. **Payments** — client account structure and what's actually being collected, from the COFA. (§18)
4. **Privilege + third parties** — acceptable processors for privileged material. (§13, §18)
5. **Does the marketing site keep booking permanently?** If yes, §0 is wrong and much of this changes. It shouldn't be yes.

---

## Appendix: findings in the current code

Six things this design corrects. All are in the frontend's booking implementation today; none are hard to fix, and each is cheaper to fix during the move than after.

| # | Finding | Where | Severity |
|---|---|---|---|
| 1 | **Fail-open cron auth.** `if (secret)` — an unset `CRON_SECRET` skips authentication entirely and the endpoint is public. | `app/api/cron/reminders/route.ts:15-21` | **High** |
| 2 | **`EXCLUDE` constraint needs `WHERE status = 'CONFIRMED'`.** As specified, a cancelled booking would block its slot forever. | `prisma/README.md:19` | **High** (if built as written) |
| 3 | **`manageToken` stored plaintext.** It's a bearer credential; a DB dump is a set of live capability URLs. Hash it. | `schema.prisma:75`, `Booking.ts:8` | **High** |
| 4 | **Reminder read-modify-write race.** `findDueForReminder` → send → `save` has no claim; two workers both send. Currently masked by single-instance execution — surfaces the moment you scale out. | `use-cases/sendDueReminders.ts:29-43` | **Medium** |
| 5 | **`renderedAtMs` is client-supplied and unsigned**, so the "too fast" check is trivially bypassed. HMAC-sign it. (Honest heuristic today, but cheap to harden.) | `ports.ts:91`, `HoneypotSpamGuard.ts:24` | **Low** |
| 6 | **`InMemoryRateLimiter` is per-process** — across N replicas the limit becomes 5N. Already documented; Redis fixes it. | `InMemoryRateLimiter.ts`, `prisma/README.md:60-67` | **Medium** (on scale-out) |

None of these are criticisms of the existing work. #4 and #6 are correct choices for a single-instance dev deployment and are documented as such; #5 is explicitly described as a heuristic. They're listed because *scaling out and adding a real database is exactly the moment each one stops being safe* — and that moment is this project.
