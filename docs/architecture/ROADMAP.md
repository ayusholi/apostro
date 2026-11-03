# Roadmap

_Planning stages, not commitments. Order may change as the product is validated. Last updated: 2026-11-02._

## Stage 1 — Foundation  ✅ **complete (2026-11-03), pending first CI run**
Project structure, tenant model, database setup, security boundaries, documentation and tests.
- Done: tenancy schema + migration; tenant context, scoped client, composite FKs; firm permissions; minimal client/matter/task endpoints; audit writer; unit tests; ADRs and docs; dev seed; compose test database.
- Verified 2026-11-03: integration suite (30 tests) and migration against real Postgres + Redis; dev-database seed and API smoke test; CI workflow and tenant OpenAPI added. Remaining: confirm the CI workflow passes on GitHub.

## Stage 2 — Identity and onboarding
Firm creation, invitations (token, expiry, acceptance into `FirmMembership`), membership management with transactional audit, initial firm setup (matter types, reference format), MFA, JWT key rotation, rate limiting, `/me/firms`-driven firm switcher in the frontend.

## Stage 3 — Core legal workspace
Client and matter CRUD, matter reference sequences, configurable stages, tasks and appointments, enquiries (conversation of kind `ENQUIRY` → client + matter conversion with conflict check), activity timeline, **work-queue endpoint** (the frontend's My Work), resource-level matter restrictions if required. Connect the `/workspace` frontend to the API.

## Stage 4 — Communications
Unified inbox APIs, assignment, internal notes, website enquiry intake, message history; email first, then WhatsApp Business; `awaitingResponseSince` maintenance; first BullMQ processors.

## Stage 5 — External integrations
Google Workspace, Microsoft 365, LEAP (after verification) and other confirmed providers, per `INTEGRATION_STRATEGY.md`: connection model, encrypted credentials, webhooks, sync cursors.

## Stage 6 — Documents and workflows
Document storage (S3-compatible, malware scanning, presigned access), client onboarding, document requests, workflow automation, matter history.

## Stage 7 — Advanced capabilities
AI-assisted administration with human review, legal document workflows, court preparation, billing and further practice management.

## Product decisions
_Decided 2026-11-03._
- **Legacy single-firm modules** in `backend/src/modules` (CMS, public booking, enquiries, reviews, notifications, media, …) will be **retired and rebuilt per firm** on the tenant model (`/firms/:firmId`, firm permissions, scoped queries). The single-firm stubs and their global `authorize()` routes are removed as each per-firm replacement lands; nothing new is built on them.
- **The marketing site** in `frontend/(marketing)` belongs to **this product**, not to one customer. Its current "ALLS Solicitors" content will be **rebranded later**, and the product will get its own separate marketing homepage.

## Open product questions
- None currently.
