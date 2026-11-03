# Domain model

_Last updated: 2026-11-02. Source of truth: `backend/prisma/schema.prisma` and `backend/prisma/migrations/`. Update this file whenever either changes._

## Postgres schemas

| Schema | Holds | Tenant-owned? |
|---|---|---|
| `identity` | `User`, `Session`, `RefreshToken`, `VerificationToken` (pre-existing); `Firm`, `FirmMembership` (new) | `FirmMembership` only |
| `practice` | `Client`, `Matter`, `MatterClient`, `Task`, `Conversation`, `Message`, `MessageProviderRef`, `ActivityEvent` | All |
| `audit` | `AuditEvent` | No (nullable `firmId`, no FKs) |

## Entities

```text
User ──< FirmMembership >── Firm
                │              │
                │              ├──< Client ──< MatterClient >── Matter
                │              │                                 │
   (responsible, assignee,     ├──< Task  (matter?, client?, assignee?, createdBy?)
    actor — always via         ├──< Conversation (client?, matter?, assignee?)
    FirmMembership)            │        └──< Message ──< MessageProviderRef
                               └──< ActivityEvent (matter?, client?, actor?)
AuditEvent  (append-only; firmId?, actorUserId?; no FKs)
```

### Identity and tenancy
- **User**: a person's identity and login (pre-existing). Has no firm. One user can have many memberships.
- **Firm**: the tenant.
  - `slug` is globally unique, lowercase and URL-safe (CHECK).
  - `status` is `ACTIVE`, `SUSPENDED` or `CLOSED`; only `ACTIVE` firms establish context.
- **FirmMembership**: a user's place in a firm.
  - `role`: `OWNER`, `ADMIN`, `FEE_EARNER` or `SUPPORT`.
  - `status`: `INVITED`, `ACTIVE`, `SUSPENDED` or `REMOVED`.
  - Constraints: `@@unique([firmId, userId])` and `@@unique([firmId, id])`.
  - Every "person" reference in the practice schema points here, not at `User`.
  - Removal is soft (`REMOVED`): tasks, matters and activity still reference the row. `INVITED` is currently unused — invitations live in `FirmInvitation` and a membership is created only on acceptance.
  - Invariant (application-enforced under a firm-row lock): every firm keeps at least one `ACTIVE` `OWNER`.
- **FirmInvitation** (Stage 2): an offer to join a firm with a role.
  - `email` (lowercase, CHECK), `role`, `tokenHash` (SHA-256 of the emailed token; unique), `expiresAt` (7 days).
  - `invitedByMembershipId` and `acceptedMembershipId` are composite FKs into the same firm.
  - Ends exactly one way: `acceptedAt` + `acceptedMembershipId` together, or `revokedAt` (CHECKs).
  - At most one pending invitation per (firm, email): partial unique index. Re-inviting revokes the previous one.

### Practice
- **Client**: an individual or organisation.
  - `status`: `PROSPECT`, `ACTIVE` or `ARCHIVED`.
  - Fields: `displayName`, plus optional `email` and `phone`. Deliberately minimal.
- **Matter**:
  - `reference` is unique **per firm** (`@@unique([firmId, reference])`).
  - `matterType` is free text (firms define their practice areas).
  - `status` is the system lifecycle: `OPEN`, `ON_HOLD`, `CLOSED` or `ARCHIVED`.
  - `stage` is free-text, firm-specific progress (e.g. "Exchange").
  - `responsibleMembershipId` is optional.
  - `closedAt` is set exactly when the status is `CLOSED` or `ARCHIVED` (CHECK).
- **MatterClient**: many-to-many. Primary key is `(firmId, matterId, clientId)`; `role` is `CLIENT`, `JOINT_CLIENT` or `OTHER`. A matter can have several clients, or none yet.
- **Task**:
  - `status` is `OPEN`, `DONE` or `CANCELLED`; `completedAt` is set exactly when `DONE` (CHECK).
  - Optional links: matter, client, assignee and creator, all memberships of the same firm.
- **Conversation**: the provider-neutral inbox thread.
  - `channel`: `EMAIL`, `WHATSAPP`, `WEB_FORM`, `PHONE` or `INTERNAL`.
  - `kind`: `ENQUIRY`, `CLIENT` or `OTHER`. `status`: `OPEN`, `CLOSED` or `ARCHIVED`.
  - `contactName` and `contactAddress` hold the counterparty for enquiries without a client.
  - Optional client, matter and assignee.
  - `awaitingResponseSince` and `lastMessageAt` are maintained by (future) message ingestion.
- **Message**: `direction` (`INBOUND`, `OUTBOUND`, `INTERNAL_NOTE`), `deliveryStatus`, `occurredAt`, `senderLabel`, and `bodyText`, which is confidential and never logged.
- **MessageProviderRef**: `provider` (free text), `providerMessageId` and `providerThreadId`. `@@unique([firmId, provider, providerMessageId])` is the ingestion idempotency key. No raw payloads.
- **ActivityEvent**: the timeline.
  - `type`: `MATTER_OPENED`, `MATTER_STATUS_CHANGED`, `TASK_CREATED`, `TASK_COMPLETED`, `MESSAGE_RECORDED`, `NOTE_ADDED` or `DOCUMENT_ADDED`.
  - Also: a short `summary`, a `subjectId`, and optional matter, client and actor.

### Audit
- **AuditEvent**: `action`, `outcome` (`SUCCESS`, `FAILURE`, `DENIED`), `firmId?`, `actorUserId?`, `resourceType?`, `resourceId?`, `requestId`, `ipAddress?`, `metadata?` and `occurredAt`. Append-only by trigger.

## Tenant ownership rules (enforced by the database)

1. Every practice table has a required `firmId` (FK → `Firm`) and `@@unique([firmId, id])`.
2. Every reference between tenant-owned rows is a composite FK `(firmId, xId) → X(firmId, id)` that shares the row's own `firmId`. A row therefore cannot reference another firm's record. When the optional `xId` is null, the FK is not checked (`MATCH SIMPLE`).
3. All practice FKs are `ON DELETE RESTRICT ON UPDATE RESTRICT`. Records are archived by status, not deleted, and cannot change tenant.

## Hand-written constraints (in `20261102120000_tenancy_practice_foundation/migration.sql`)

| Constraint | Rule |
|---|---|
| `Firm_slug_format_check` | `slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'` |
| `Task_completedAt_matches_status_check` | `(status = 'DONE') = (completedAt IS NOT NULL)` |
| `Matter_closedAt_matches_status_check` | `(status IN ('CLOSED','ARCHIVED')) = (closedAt IS NOT NULL)` |
| `Matter_reference_not_blank_check`, `Task_title_not_blank_check`, `Client_displayName_not_blank_check` | `btrim(x) <> ''` |
| `AuditEvent_append_only`, `AuditEvent_no_truncate` triggers | Reject `UPDATE`, `DELETE` and `TRUNCATE` |

## Indexes supporting the target queries

| Query | Index |
|---|---|
| My work queue: my open tasks by due date | `Task(firmId, assigneeMembershipId, status, dueAt)` |
| A matter's outstanding tasks | `Task(firmId, matterId, status)` |
| Unassigned enquiries / my conversations, newest first | `Conversation(firmId, status, assigneeMembershipId, lastMessageAt)` |
| Conversations awaiting a response | `Conversation(firmId, status, awaitingResponseSince)` |
| A client's matters | `MatterClient(firmId, clientId)` |
| A matter's or client's recent activity | `ActivityEvent(firmId, matterId, occurredAt)`, `(firmId, clientId, occurredAt)` |
| Firm client list by name | `Client(firmId, status, displayName)` |
| Tenant resolution | `FirmMembership(firmId, userId)` unique |

## Decisions worth knowing

- **Matter reference generation is not implemented.** References are supplied by the creator (only the seed creates matters today). A per-firm sequence and format setting is deferred to Stage 3.
- **Matter types and stages are free text** until firms can configure workflows.
- **Communications status** is deliberately small. "Awaiting response" is a timestamp kept by ingestion, not derived from scanning messages.

## Deliberately deferred

| Entity | Introduce when |
|---|---|
| Firm settings, matter types, stage definitions, reference sequences | Stage 2–3, firm onboarding and matter creation |
| `MatterAccess` / restricted matters | When confidential matters or ethical walls are required (ADR-004) |
| Client contact details (addresses, multiple contacts), ID verification, conflict-check records | Stage 3, with a data-protection review |
| `Contact` / conversation participants (multiple parties) | Stage 4, when group threads or CC'd parties matter |
| `IntegrationConnection`, encrypted credentials, sync cursors, webhook receipts | Stage 5, first integration (ADR-005) |
| Appointments | Stage 3 (the frontend shows them; the legacy booking design is single-firm) |
| Documents, document requests | Stage 6, needs storage and malware-scanning design |
| Billing, time recording | Stage 7 |
