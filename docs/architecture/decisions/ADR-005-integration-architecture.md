# ADR-005 — Provider-neutral integration architecture

- **Status:** Proposed. Only the provider-neutral data model is implemented; no adapters, credentials or provider calls exist.
- **Date:** 2026-11-02

## Context

The product will connect to Google Workspace (Gmail, Calendar), Microsoft 365 (Outlook, Graph), WhatsApp Business, LEAP and others. None is connected now, and the capabilities, permissions and licensing of several (notably LEAP) are unverified.

## Problem

We want provider data to arrive without provider-specific logic spreading through the core domain, and without building speculative adapters.

## Options considered

1. Provider-specific tables and code paths per integration (`GmailMessage`, `WhatsAppMessage`, …).
2. **A provider-neutral core model plus thin per-provider adapters that translate to and from it.**
3. A third-party unified-API vendor in front of all providers.

## Decision

Option 2, as a direction. What exists now:

- The core conversation model is provider-neutral:
  - `Conversation` has a `channel` enum (`EMAIL`, `WHATSAPP`, `WEB_FORM`, `PHONE`, `INTERNAL`);
  - `Message` has `direction` and `deliveryStatus`.
- Provider identifiers live only in `MessageProviderRef` (`provider` as free text, `providerMessageId`, `providerThreadId`). `@@unique([firmId, provider, providerMessageId])` is the idempotency key for future webhook and sync ingestion.
- No raw provider payloads are stored.

Deferred until the first real integration: the adapter interface, `IntegrationConnection` (status per firm and provider), encrypted credential storage, webhook endpoints, sync cursors and queues. The intended responsibilities are specified in `INTEGRATION_STRATEGY.md`. Option 3 remains open as an implementation choice for a specific adapter.

## Reasons

- Adding a provider then needs a new adapter, not a schema change in the core.
- The ingest dedupe key exists from day one, so duplicate webhook delivery can't create duplicate messages.

## Consequences and trade-offs

- Provider-specific features (labels, reactions, read receipts) need either a neutral representation or explicit, documented omission.
- The real adapter interface will be shaped by the first two providers. Designing it before then would be guesswork.

## Security implications

- Tokens must never be stored in plaintext. The plan is envelope encryption with a KMS-held key (`INTEGRATION_STRATEGY.md`).
- Webhook bodies are untrusted input: verify signatures, normalise, store only what's needed, and drop the rest.

## Alternatives rejected

Option 1 duplicates the inbox per provider and couples the domain to each API.

## Revisit when

The first integration is commissioned. At that point, accept or amend this ADR with the concrete adapter interface and credential design.
