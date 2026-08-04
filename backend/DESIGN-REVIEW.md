# Pre-Implementation Design Review — ALLS Solicitors Backend

Reviewing the design suite (ARCHITECTURE, DATABASE, API, FOLDER-STRUCTURE, AUTH, RBAC, INFRA, CMS, BOOKING) **as if it will hold real client data for a UK law firm** — where a breach is simultaneously an ICO notification, an SRA matter, and a legal-professional-privilege problem.

Findings are prioritized by **impact**, not by dimension. Each says *why it matters for this specific context* and *what to change*. Nothing here is a reason to stop — the design is sound; these are the gaps to close before or during early implementation.

---

## Verdict

**Strong design, not yet safe to build against as-is.** The architecture is security- and compliance-forward to a degree most projects never reach: the `EXCLUDE`-constraint correctness model, deny-by-default two-layer authz, hashed tokens, envelope encryption, retention-as-policy, and the honest "not traffic-bound, optimise for correctness" framing are all right. 

The gaps are concentrated in three places, and they're the places that bite a **law firm** specifically:
1. **Data-subject rights mechanics** (SAR export, erasure job, the audit-log/erasure tension) — designed as principles, not as buildable mechanisms.
2. **Cryptographic & secrets operations** (JWT key rotation, Redis PII posture, processor residency) — the operational half of security, thinner than the architectural half.
3. **It's nine design docs and zero code** — the load-bearing claims are unproven.

---

## P0 — Critical (resolve before, or in the first sprint of, implementation)

### 1. Prove the load-bearing claims before designing more `[Architecture · Maintainability]`
The entire design rests on two assertions that are cheap to write and expensive to get subtly wrong:
- the `EXCLUDE` constraint actually prevents double-booking **under real concurrency**, and
- CASL conditions actually reach **every** Prisma query path that reads client data (one missed path = IDOR).

**Risk for a law firm:** an elegant design that leaks a matter file or double-books is worse than a plain one that doesn't.
**Do:** build the Phase-0/1 walking skeleton now — the booking write path + the mandatory **N-concurrent-booking test** (ARCHITECTURE §16) + an **IDOR regression test per resource** — and validate before writing further design. This retires the most risk per week (the phasing already says this; treat it as gating, not aspirational).

### 2. Subject Access Request (SAR) export is not designed `[GDPR]`
GDPR Art 15 (access) and Art 20 (portability) are **certainties** for a firm — clients and ex-clients will request "everything you hold on me." No doc describes assembling that across `Booking`, `ContactEnquiry`, `Client`, `Notification`, `ConsentRecord`, and `AuditLog`.
**Do:** design a **SAR export job** — a per-subject data map (every table keyed by email/clientId), requester identity verification, a machine-readable export format, redaction of *other* people's data caught in the same records, and the 1-month statutory SLA. This is a first-class feature, not an afterthought. New doc / DATABASE §6 extension.

### 3. The audit log vs. right-to-erasure tension is unresolved `[GDPR · Security]`
`AuditLog` is append-only, holds PII (email snapshots, IPs) for years, and the app role has no `DELETE` — **correct for evidence, and directly in tension with erasure.** An ICO auditor asks this exact question.
**Do:** document the **lawful basis** (legal obligation / legitimate interest for a tamper-evident record) that overrides erasure for the audit trail, *and* decide the pseudonymisation policy — e.g. on account deletion, keep the `actorId` linkage but null the direct identifier (`actorLabel`), so the trail stays intact without retaining an erased person's email indefinitely. Write it down before an auditor asks.

### 4. JWT signing-key rotation has no design (`kid` + JWKS) `[Authentication · Security]`
AUTH-DESIGN chose RS256 for key separation but assumes a **single key pair**, no `kid` claim, no verification-key registry. RS256 keys **must** rotate (hygiene, or after a compromise), and rotating without `kid` **invalidates every live token at once** and can't support overlap.
**Do:** add a `kid` header now, support **overlapping active keys** during rotation, and expose verification keys via a JWKS endpoint (or signed config). Cheap now, near-impossible to retrofit cleanly. AUTH §2.1.

---

## P1 — High

### 5. Execute the stack-fork resolution, don't just declare it `[Maintainability]`
Express is canonical, but ARCHITECTURE and RBAC still *read* NestJS-native behind a mapping banner. A new developer reads nine docs; two speak a different framework and require mental translation on every mechanism.
**Do:** a proper re-languaging pass on those two docs (or accept a permanent onboarding tax and document it as such). The decision is made; the execution is outstanding.

### 6. The erasure / anonymisation job is under-specified `[GDPR]`
`RetentionPolicy` exists as a table; the actual **disposal mechanism** does not — which fields hard-delete vs anonymise vs retain-under-obligation, and how legal hold suspends it.
**Do:** produce a **per-entity data classification** (erasable / anonymisable / retain-under-legal-obligation) and design the disposal job that reads `RetentionPolicy` and acts per-field. The conflict is named in DATABASE §6; the resolution isn't built.

### 7. Redis security & PII posture is unstated `[Security · GDPR]`
Redis holds sessions (IP, device label), hashed tokens, and the permission cache — i.e. **PII and security material**. INFRA says "ElastiCache" and no more.
**Do:** mandate **TLS in transit, encryption at rest, and AUTH/ACL**, and make a deliberate **persistence decision** — RDB/AOF snapshots would contain PII, so either disable persistence for the sensitive keyspace or treat Redis backups as PII with DB-grade controls. INFRA §7.

### 8. Email/SMS processor residency for client PII `[GDPR]`
Confirmation emails carry client name + appointment details (personal data) to **Resend**; reminders to **Twilio** — both likely US-processed. DPAs are listed, but residency/transfer for *this* data isn't assessed.
**Do:** run the transfer assessment; prefer an **EU-resident email provider** for client-facing mail, or document the SCC/transfer basis. For a firm, "where does the client's name and appointment go" is a due-diligence answer you'll be asked for. ARCHITECTURE §9/§13.

### 9. Security-event monitoring beyond failed logins `[Monitoring]`
Failed-login alerts exist; missing are **permission-denial spikes** (probing), **audit-write failures** (evidence loss), and **anomalous export volume** (SAR abuse / exfiltration).
**Do:** forward security + audit events to a **SIEM / alerting pipeline**, not just app metrics — appropriate for privileged data, and the thing that turns "we were breached" into "we detected and contained." ARCHITECTURE §10.

---

## P2 — Medium

### 10. Manage-token-in-URL leakage `[Security]`
The booking capability token lives **in the URL** — leakable via `Referer`, browser history, shared links, and access logs, even though it's hashed at rest.
**Do:** `Referrer-Policy: no-referrer` on the manage page, **strip query strings from access logs**, keep the short TTL, and allow no third-party scripts on that page (referer exfil). AUTH §1 / API §4.1.

### 11. Verify (don't just configure) Sentry/APM PII scrubbing + residency `[Logging · GDPR]`
Redaction and Sentry are specified; for a law firm the scrubbing must be **tested**, and the processors **UK/EU-hosted with DPAs** — a privileged-content spill into a log/APM platform is reportable.
**Do:** add a CI check that known-PII fields are absent from a sampled log/exception payload; confirm processor residency. ARCHITECTURE §10.

### 12. Object-storage DR targets for future documents `[DR · Backups]`
ARCHITECTURE names Object Lock (WORM) and versioning, but **RPO/RTO targets and cross-region replication** are set only for RDS.
**Do:** when documents land, set object-storage RPO/RTO, enable **cross-region replication staying UK/EU**, and confirm Object Lock for anything under legal hold. ARCHITECTURE §7/§17.

### 13. Query discipline against N+1 `[Performance]`
Nested reads (post→author→media, solicitor→areas→offices, booking→area/solicitor/office) invite N+1, which the indexes don't fix.
**Do:** convention of explicit `select`/`include`, batch where needed, and a **query-count assertion** in integration tests for the hot list endpoints. Not urgent at this scale, but cheap to bake in now.

### 14. Separation of duties for privilege escalation `[Authorization]`
Whoever holds `user:manage-roles` can **escalate themselves** to Super Admin. RBAC audits it, but nothing prevents or dual-controls it.
**Do:** require a **second approver** for granting Super Admin / global scope, and alert on self-escalation. For a firm, self-grant of privileged-data access should be hard, not just logged. RBAC §12.

### 15. Define SLOs `[Performance · Monitoring]`
No explicit latency/availability targets, so alerts have no thresholds and the DR RPO/RTO have no context.
**Do:** set modest SLOs (availability p95 < 300 ms, booking-create p95 < 800 ms, 99.9% API availability) and wire alerts to them. ARCHITECTURE §17.

---

## P3 — Low / polish

- **16. Design-suite index `[Maintainability]`** — nine cross-referencing docs, no index. Add a README with reading order + status; number them as ADRs so decisions are traceable.
- **17. Meta-audit on audit reads `[Logging]`** — reading the compliance record should itself be audited ("who viewed the audit log").
- **18. Bot resilience reserve `[Security]`** — honeypot + timing + rate-limit is bypassable by decent bots; keep a **CAPTCHA/Turnstile** fallback ready for the public forms if abuse appears.
- **19. Concurrent-session cap `[Authentication]`** — optional per-principal active-session limit; surfaces stolen-credential reuse. Nice-to-have.

---

## What is already right (so it doesn't get "improved" away)

Called out because these are correct and should survive review unchanged:
- **`EXCLUDE` constraint as the concurrency guarantee** (not an app check) — and the availability cache correctly *backstops* to a `409`, never a double-booking, on a missed invalidation.
- **Two-layer authz** (RBAC gate + CASL-into-`where`) — structurally prevents IDOR; keep the deny-by-default global guard.
- **Staff/client principal separation**, hashed rotating refresh tokens with family reuse-detection, Redis session allowlist for immediate revocation.
- **Retention-as-policy** (not a delete button), **PECR consent separation** (transactional vs marketing), UK data residency.
- **Transactional outbox** + claim-before-send reminders + one-image-two-roles workers.
- **The honest scale assessment** — don't microservice this; optimise for correctness and auditability.

---

## Suggested remediation order

| When | Items |
|---|---|
| **Before more design** | #1 (build the skeleton + concurrency + IDOR tests) |
| **Phase 1 (booking)** | #4 (`kid`/JWKS), #10 (token-in-URL), #13 (N+1), #7 (Redis posture) |
| **Phase 3 (identity/RBAC/audit)** | #3 (audit vs erasure), #5 (stack re-language), #9 (SIEM), #11 (PII scrubbing verify), #14 (SoD), #15 (SLOs) |
| **Before Phase 5 (portal/DPIA)** | #2 (SAR export), #6 (erasure job), #8 (processor residency), #12 (object-storage DR) |
| **Ongoing / polish** | #16–#19 |

The DPIA (ARCHITECTURE Phase 5) is the natural forcing function for #2, #3, #6, and #8 — but #1, #4, #7, and #10 should not wait for it.
