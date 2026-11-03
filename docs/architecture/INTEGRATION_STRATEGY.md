# Integration strategy

_Last updated: 2026-11-02. Status: **design only** (ADR-005, proposed). No provider is connected, no credentials exist, no adapter code exists._

## 1. Shape

```text
Core services (Conversation, Message, Task, Matter …)  ← provider-neutral
        ▲                        │
        │ normalised records     │ commands (send message, create event)
        │                        ▼
Integration layer: one adapter per provider, behind a shared interface
   Google Workspace · Microsoft 365 · WhatsApp Business · LEAP · …
```

The core never imports provider SDKs. Provider identifiers live in mapping tables (today: `MessageProviderRef`), never on core models.

## 2. Responsibilities of a future adapter

| Responsibility | Expectation |
|---|---|
| Authentication / authorisation | OAuth 2.0 (or provider equivalent) per firm connection; minimum scopes; consent recorded with who connected and when |
| API communication | All provider HTTP isolated in the adapter; timeouts on every call |
| Normalisation | Translate to core shapes (channel, direction, participants, timestamps, delivery status); drop fields the product doesn't use |
| Error translation | Map to `retryable` (5xx, timeouts, 429) vs `permanent` (4xx, revoked consent, unsupported) — the worker retries only the former |
| Idempotency | Every ingested item keyed by `(firmId, provider, providerId)` (`MessageProviderRef` unique); repeated delivery is a no-op |
| Rate limits | Respect provider quotas via per-connection limiter and backoff; honour `Retry-After` |
| Sync and webhooks | Webhook for change notification where offered, plus periodic cursor-based catch-up sync to repair missed events |
| Connection status and revocation | Per-connection status (`connected / needs_reauth / revoked / error`), last-sync time, last error; revocation stops jobs and deletes tokens |
| Logging / observability | Log connection id, provider, operation, outcome, latency, provider request id — never tokens, message bodies or addresses |

## 3. Webhooks and asynchronous work

Planned flow, when the first webhook-based provider is added:

1. `POST /api/v1/webhooks/<provider>` — verify signature/token first; reject unsigned.
2. Persist a minimal **webhook receipt** (provider, provider event id, firm connection id, received time) with a unique key → duplicate deliveries detected at insert.
3. Respond `2xx` fast; enqueue a BullMQ job carrying ids only (no payload bodies in Redis beyond what's necessary), with `firmId` per ADR-002.
4. Worker re-verifies the connection and firm are active, fetches/normalises, writes via `forTenant(ctx)`, updates the sync cursor.
5. Retries: exponential backoff (defaults in `src/queues/factory.ts`), capped attempts; permanently failing jobs land in the failed set, alerting when non-empty; an operator replay tool re-enqueues by receipt id.
6. Sync cursors stored per connection and resource type; a scheduled job catches up from the last cursor.

Redis/BullMQ are already wired (`src/queues/`) but no queues are registered; nothing above exists yet.

## 4. Credential storage (plan)

- Access/refresh tokens **never stored in plaintext**. Envelope encryption: a per-record data key (AES-256-GCM) encrypts the token; the data key is encrypted by a key-encryption key held in a managed KMS (UK region). Only the encrypted blob, key id and algorithm are stored.
- Decryption only inside the worker / adapter at call time; never returned by any API; never logged.
- Access restricted to the integrations module; DB column not selected by default queries.
- Rotation: KEK rotated on schedule (re-wrap data keys); provider refresh tokens rotated per provider rules; revocation deletes ciphertext.
- Development uses a local key from the environment, clearly marked dev-only; production refuses to start without KMS configuration.

## 5. Provider notes — to verify, not assumed

| Provider | What we expect to need | To verify before committing |
|---|---|---|
| Google Workspace (Gmail, Calendar) | OAuth, Gmail push (Pub/Sub) + history sync, Calendar events | Restricted-scope verification / security assessment requirements and cost; per-user vs domain-wide delegation for small firms |
| Microsoft 365 (Outlook, Graph) | OAuth, Graph change notifications + delta queries | Admin consent model in small tenants; subscription renewal handling |
| WhatsApp Business | Cloud API, webhooks, message templates | Business verification, 24-hour messaging window rules, template approval, per-conversation pricing, data residency |
| **LEAP** | Matter/client sync or deep links | **Unknown.** API availability, partner programme, licensing, permitted data flows, and whether sync or link-out is appropriate must be confirmed with LEAP before any design. Nothing in this repo assumes a LEAP API exists. |
| E-signature, accounting, payments | Per provider | Chosen per verified capability and commercial terms |

## 6. What exists today

- `Conversation.channel`, `Message.direction/deliveryStatus` — provider-neutral.
- `MessageProviderRef` with the ingestion idempotency unique key.
- Nothing else. No empty adapter classes were created on purpose.
