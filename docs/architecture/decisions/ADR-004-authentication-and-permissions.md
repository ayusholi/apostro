# ADR-004 — Authentication boundary and firm-level permissions

- **Status:** Accepted (implemented for firm-level permissions); resource-level restrictions are **proposed**.
- **Date:** 2026-11-02

## Context

`backend/src/modules/auth` is a working, carefully built authentication module:
- Argon2id passwords, RS256 access tokens (15 min), opaque hashed refresh tokens with rotation and reuse detection;
- a Redis session allowlist for immediate revocation;
- email verification, password reset and session management.

Its tokens are identity-only (`sub`, `sid`, `typ`), with no roles. The older RBAC design (`backend/RBAC-DESIGN.md`) gives roles to users globally, for one firm; its permission resolver denies everything until wired.

## Problem

In a multi-tenant product, a person's role depends on which firm they're acting in. We need the smallest permission boundary that works now and can grow into role configuration and per-matter restrictions without route rewrites.

## Options considered

1. Put the firm and role in the access token.
2. Keep tokens identity-only; resolve membership and role per request from the database.
3. Implement the full DB-backed RBAC engine from `RBAC-DESIGN.md`, scoped per firm.

## Decision

- **Authentication is unchanged.** The existing module is preserved as-is. It is not production-complete (no MFA, no SSO, no key rotation; see `SECURITY_AND_TENANCY.md`), but it isn't insecure and doesn't need replacing.
- **Option 2 for tenancy.** The membership row (`FirmMembership.role`, `status`) is read on every tenant request by `resolveTenant()`. Removing or suspending a member takes effect on their next request.
- **Firm permissions** are a static role → permission map in code (`backend/src/modules/tenancy/permissions.ts`).
  - Roles: `OWNER`, `ADMIN`, `FEE_EARNER`, `SUPPORT`.
  - Permissions: `resource:action` strings (`client:read`, `matter:write`, `member:manage`, `audit:read`, …).
  - Routes check permissions with `requireFirmPermission(...)`, never role names. Denials are audited.
- **Resource-level access** has a single choke point: `matterVisibility(ctx)` in `matters.service.ts`, which every matter read, and every client-timeline read, goes through. Today it returns "all matters in the firm". Restricted or ring-fenced matters will be added there.
- **The legacy global `authorize()` middleware** and its deny-by-default resolver are left in place for the legacy admin routes. They are not used by tenant routes.

## Reasons

- Putting firm and role in the token would make revocation and role changes wait for token expiry, and multi-firm users would need a token per firm.
- A static map is reviewable in one file and fully unit-tested (a role × permission matrix). Making roles configurable later swaps the map's source without touching routes.

## Consequences and trade-offs

- One extra indexed query per tenant request (`FirmMembership` by `firmId, userId`). It's cheap, and can be cached in Redis later, with invalidation on membership change.
- Firms cannot yet customise roles.
- Platform-level administration (operating across firms) is **not implemented**. There is no platform-admin flag, and no route can cross tenants. When it's added, it must be a separate principal or surface with its own audit, not a "super" firm role.

## Security implications

- A user ID or firm ID in a request is never treated as proof. The proof is the verified JWT plus the session allowlist plus the membership row.
- `typ: 'staff'` tokens are required on tenant routes. The client-portal principal from the older design doesn't exist yet.

## Alternatives rejected

- **Full RBAC engine now:** it adds tables, caching and invalidation work before any firm needs custom roles.
- **Roles in the JWT:** stale authorisation for up to the token TTL.

## Revisit when

- Firms ask for custom roles: move the map into tables per firm.
- Confidential matters or ethical walls are needed: implement `matterVisibility` with a `MatterAccess` table.
- MFA or SSO is required: extend the auth module, keeping the same principal shape.
