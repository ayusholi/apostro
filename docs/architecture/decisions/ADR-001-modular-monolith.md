# ADR-001 — Modular monolith on the existing Express/TypeScript backend

- **Status:** Accepted (implemented)
- **Date:** 2026-11-02

## Context

The repository already contains a working backend (`backend/`): Express 5, TypeScript, Prisma, PostgreSQL, Redis, BullMQ, pino, Zod, Docker. It has one finished feature module (authentication) and a set of routed-but-unimplemented modules from an earlier single-firm design (see ADR-002 for the change of direction). The product is now a multi-tenant SaaS for small UK law firms, built incrementally by a small team.

## Problem

We need a backend shape that a small team can run cheaply today, that keeps domain areas (identity, tenancy, clients, matters, tasks, communications, integrations, audit) from tangling, and that doesn't force a rewrite as integrations and workflows arrive.

## Options considered

1. **Keep and extend the existing Express app as a modular monolith.**
2. Replace it with a different framework (e.g. NestJS, Fastify).
3. Split into services now (identity, practice, communications, integrations).

## Decision

Option 1. One deployable API process plus one worker process (same image), with code organised as modules under `backend/src/modules/<module>/` (`*.routes.ts`, `*.controller.ts`, `*.service.ts`, `*.schema.ts`, optional `*.repository.ts`), and shared infrastructure in `src/shared`, `src/middleware`, `src/db`, `src/queues`.

Modules added in this phase: `tenancy`, `clients`, `matters`, `tasks`, and an `audit.writer` inside the existing `audit` module. Communications, integrations and platform administration have schema or documentation only; no empty module folders were created for them.

## Reasons

- The existing operational foundation (fail-closed config, RFC 9457 errors, request correlation, redacted structured logging, liveness/readiness, helmet, strict CORS, Docker) is sound. Replacing it would cost time and add risk for no capability gain.
- A monolith keeps transactions simple. Creating a task and its timeline entry, or a membership change and its audit record, is one database transaction.
- Module boundaries plus explicit service inputs (`TenantContext` first) keep a later extraction possible: a module talks to others through exported service functions, not their tables.

## Consequences and trade-offs

- All modules share one database and one deploy. A bad deploy affects everything; mitigated by tests and blue/green deploys (see `backend/ARCHITECTURE.md` §17).
- Module boundaries are a convention, not yet enforced by tooling. A lint rule for cross-module imports (e.g. `eslint-plugin-boundaries`) is recommended once there are more modules.
- The worker exists but registers no processors. BullMQ stays dormant until a feature needs background work.

## Security implications

One process holds every module's code. Tenant isolation therefore can't rely on process boundaries. It's enforced per request and in the database (ADR-002).

## Alternatives rejected

- **New framework:** no capability we need is missing from Express, and the auth module would have to be ported.
- **Microservices now:** distributed transactions, service-to-service auth and multiplied operational cost, for a product with a handful of tenants and no proven scaling pressure.

## Revisit when

- One module has a clearly different scaling or security profile (document storage and provider sync workers are the likely first candidates).
- Deploy coupling repeatedly blocks independent teams.
