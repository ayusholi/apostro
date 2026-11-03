# Architecture documentation

This folder is the current, authoritative record of how the Apostro platform is built, and why. Read [`IMPLEMENTATION_STATUS.md`](./IMPLEMENTATION_STATUS.md) first at the start of any development session; it states what exists, what's verified, and what to do next.

| Document | Purpose |
|---|---|
| [`IMPLEMENTATION_STATUS.md`](./IMPLEMENTATION_STATUS.md) | Factual state: what exists, what was tested, outstanding issues, next step. Updated every phase. |
| [`SYSTEM_OVERVIEW.md`](./SYSTEM_OVERVIEW.md) | Components, modules, request flow, development and deployment setup |
| [`DOMAIN_MODEL.md`](./DOMAIN_MODEL.md) | Entities, tenant ownership, constraints, deferred entities. Matches `backend/prisma/schema.prisma`. |
| [`SECURITY_AND_TENANCY.md`](./SECURITY_AND_TENANCY.md) | Tenant isolation, authn/authz boundaries, logging rules, outstanding security work |
| [`INTEGRATION_STRATEGY.md`](./INTEGRATION_STRATEGY.md) | Provider-neutral integration design, adapter responsibilities, credentials, webhooks |
| [`ROADMAP.md`](./ROADMAP.md) | Staged product and platform plan |
| [`decisions/`](./decisions) | Architecture Decision Records (ADR-001 … ADR-006) |

## Relationship to `backend/*.md`

`backend/` contains an earlier design suite (`ARCHITECTURE.md`, `DATABASE-DESIGN.md`, `AUTH-DESIGN.md`, `RBAC-DESIGN.md`, `API-DESIGN.md`, `CMS-DESIGN.md`, `BOOKING-DESIGN.md`, `INFRASTRUCTURE-DESIGN.md`, `DESIGN-REVIEW.md`) written for a **single firm** ("ALLS Solicitors": marketing CMS, public booking, global staff roles).

- Where those documents assume one firm, they are **superseded by ADR-002 and ADR-004**.
- Their guidance on infrastructure, authentication internals, error handling, logging, queues and deployment **still applies** unless an ADR here says otherwise.
- The CMS, booking and other single-firm modules they describe remain in `backend/src/modules/` as routed stubs that return `501`. They will be retired and rebuilt per firm (`ROADMAP.md`, Product decisions).

## ADR conventions

Each ADR records its status (proposed, accepted, superseded or deprecated), date, context, problem, options, decision, reasons, consequences, security implications, rejected alternatives, and when to revisit. "Accepted" means implemented or explicitly agreed. Recommendations for later are marked "proposed". Add new ADRs with the next number; never rewrite an accepted ADR. Supersede it instead.
