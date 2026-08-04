# REST API Design — ALLS Solicitors

Design document. **No controllers are generated here** — this defines routes, auth, permissions, DTOs, response models, error semantics, and list behaviour (pagination / filtering / searching / sorting). It is the input to the eventual NestJS controllers + the OpenAPI doc generated from the Zod contracts (`packages/contracts`).

Builds on [`ARCHITECTURE.md`](./ARCHITECTURE.md) §3–§5, §11–§12 and [`DATABASE-DESIGN.md`](./DATABASE-DESIGN.md).

---

## 0. Conventions (apply to every endpoint)

### 0.1 Base path & the three surfaces

All routes are under **`/api/v1`** (URI versioning — §3). The path segment after the version is the **security surface**, deliberately baked into the URL (§3) so auth, cache, and rate-limit policy are visible and separable:

| Surface | Prefix | Principal | Auth | Cache | Rate limit |
|---|---|---|---|---|---|
| **Public** | `/api/v1/public/*` | anonymous / capability token | none, or `manageToken` | CDN-able | strict per-IP |
| **Portal** | `/api/v1/portal/*` | client | JWT (matter-scoped) | none | moderate per-account |
| **Admin** | `/api/v1/admin/*` | staff | JWT + **MFA** + RBAC | none | moderate, IP-allowlistable |
| **Webhooks** | `/api/v1/webhooks/*` | external provider | signature verification | none | provider-keyed |

**Auth legend** used in every module table:

- 🟢 **None** — anonymous public.
- 🔑 **Capability** — `manageToken` bearer (hashed lookup, constant-time, expiring; §4.1).
- 🔵 **Portal** — client JWT (`Authorization: Bearer`).
- 🔴 **Admin** — staff JWT + enrolled MFA + permission check.

### 0.2 Standard headers

| Header | Direction | When |
|---|---|---|
| `Authorization: Bearer <access-jwt>` | in | Portal + Admin |
| `Idempotency-Key: <uuid>` | in | **Required** on `POST /public/bookings`, `POST /public/contact`, and all future payment mutations (§3). Key→response cached in Redis 24h; repeat replays the stored response |
| `X-Request-Id` | in/out | correlation id, propagated into logs and job payloads (§10); generated if absent |
| `Retry-After` | out | on every `429` and `503` (§3) |
| `Set-Cookie` (refresh) | out | `httpOnly; Secure; SameSite=Lax`, path-scoped to the surface's `/auth/refresh` (§4). **Never** in a JSON body |

### 0.3 Pagination — two schemes, chosen per resource (§3)

**Cursor** (default for unbounded/mutable lists — bookings, enquiries, notifications, audit, media, admin content):

```
GET ...?limit=20&cursor=<opaque>&sort=-createdAt
→ 200 { "data": [ ... ], "pageInfo": { "nextCursor": "…"|null, "hasNextPage": true } }
```
- `limit` default 20, max 100. Opaque base64 cursor encodes `(sortKey, id)` — stable under concurrent inserts, unlike offset.

**Offset** (blog public reads only — the frontend already does `?page=N` and those URLs are Google-indexed; cursor would break deep links/SEO, §3):

```
GET /public/blog/posts?page=1&pageSize=12
→ 200 { "data": [ ... ], "pagination": { "page": 1, "pageSize": 12, "total": 57, "totalPages": 5 } }
```

### 0.4 Filtering / searching / sorting (list endpoints)

- **Filtering** — explicit whitelisted query params per endpoint (e.g. `?status=CONFIRMED&practiceArea=family-law`). Unknown filter keys → `400 VALIDATION_FAILED`. Never a generic query language.
- **Searching** — `?q=<term>` where supported; each endpoint documents which fields it searches. Case-insensitive; trigram/`ILIKE` on small sets, Postgres FTS where a table warrants it (blog).
- **Sorting** — `?sort=field` / `?sort=-field` (leading `-` = desc); comma-separated for multi-key (`?sort=-featured,-reviewDate`). Only whitelisted fields; default stated per endpoint. Every sort has an implicit `,id` tiebreak for stable pagination.

Public list responses are **published-only + `deletedAt IS NULL`**, always. Admin lists can opt into unpublished/soft-deleted via explicit filters (`?status=DRAFT`, `?includeDeleted=true`).

### 0.5 Error model — RFC 9457 Problem Details (§11)

Every error is `application/problem+json`, carrying the existing `DomainError.code` **unchanged** (it's the frontend's contract — do not invent a new taxonomy):

```json
{ "type": "https://alls.law/errors/slot-unavailable", "title": "Slot no longer available",
  "status": 409, "code": "SLOT_NO_LONGER_AVAILABLE",
  "detail": "That time was just taken.", "fieldErrors": {}, "traceId": "req_01H…" }
```

**Universal errors — assumed on every endpoint, not repeated in module tables:**

| Status | Code | When |
|---|---|---|
| 400 | `VALIDATION_FAILED` | Zod boundary failure; `fieldErrors` populated |
| 401 | `UNAUTHENTICATED` | missing/expired/invalid token (Portal + Admin) |
| 403 | `FORBIDDEN` | authenticated but lacks permission / out of scope |
| 404 | `NOT_FOUND` | uniform — **never** distinguishes "missing" from "not yours" (§5, prevents IDOR probing) |
| 429 | `RATE_LIMITED` | + `Retry-After` |
| 500 | `INTERNAL` | `{ code, traceId }` only — never leaks internals |
| 503 | — | dependency down; + `Retry-After` |

Module tables list only the **domain-specific** errors beyond these. Code→status map is fixed by §11 (`SLOT_NO_LONGER_AVAILABLE`→409, `SPAM_REJECTED`→422, `OUTSIDE_NOTICE_WINDOW`/`OUTSIDE_BOOKING_WINDOW`→422, `RATE_LIMITED`→429).

### 0.6 Permissions

Guards check **permissions, not roles** (§5), and resource scope is pushed into the Prisma `where` via CASL (structurally prevents IDOR). Permission keys are `resource:action` (from `DATABASE-DESIGN.md` §2.1). Portal endpoints are implicitly scoped to `clientId = self`; no permission key needed beyond authentication.

---

## 1. Authentication (`/auth`)

Three principals, three mechanisms (§4). Split across the **admin** (staff) and **portal** (client) surfaces.

### 1.1 Staff — `/api/v1/admin/auth/*`

| Method | Route | Auth | Perm | Request DTO | Success |
|---|---|---|---|---|---|
| POST | `/admin/auth/login` | 🟢 | — | `LoginDto {email, password}` | `200 LoginResult` — either `{accessToken, expiresIn, principal}` **or** `{mfaRequired: true, mfaToken}` |
| POST | `/admin/auth/mfa/verify` | 🟢 + `mfaToken` | — | `MfaVerifyDto {mfaToken, code}` | `200 AuthTokens {accessToken, expiresIn, principal}` + refresh cookie |
| POST | `/admin/auth/refresh` | refresh cookie | — | — | `200 AuthTokens` + rotated refresh cookie |
| POST | `/admin/auth/logout` | 🔴 | — | — | `204` (revokes session `sid` → Redis denylist) |
| GET | `/admin/auth/me` | 🔴 | — | — | `200 StaffPrincipal {id, email, fullName, roles[], permissions[]}` |
| POST | `/admin/auth/mfa/enroll` | 🔴 | — | — | `200 MfaEnrollment {secret, otpauthUri, recoveryCodes[]}` |
| POST | `/admin/auth/mfa/enroll/confirm` | 🔴 | — | `MfaConfirmDto {code}` | `204` (sets `mfaEnrolledAt`) |
| POST | `/admin/auth/password/change` | 🔴 | — | `PasswordChangeDto {currentPassword, newPassword}` | `204` |
| POST | `/admin/auth/password/forgot` | 🟢 | — | `ForgotPasswordDto {email}` | `202` (always — never reveals existence) |
| POST | `/admin/auth/password/reset` | 🟢 + reset token | — | `ResetPasswordDto {token, newPassword}` | `204` |

**Domain errors:** `401 INVALID_CREDENTIALS` (uniform for bad email *or* password), `401 MFA_REQUIRED`, `401 MFA_INVALID`, `423 ACCOUNT_LOCKED` (progressive Redis lockout, §4.2), `422 PASSWORD_BREACHED` (HIBP check at set-time), `410 RESET_TOKEN_EXPIRED`.

**Notes:** access JWT is RS256, 15-min TTL (§4). Refresh is opaque, hashed, rotating, with family reuse-detection — presenting a consumed refresh token revokes the whole family and returns `401`. `login` on an un-enrolled account returns `mfaRequired` and forces enrollment (MFA mandatory, §4.2).

### 1.2 Client — `/api/v1/portal/auth/*`

| Method | Route | Auth | Request DTO | Success |
|---|---|---|---|---|
| POST | `/portal/auth/magic-link` | 🟢 | `MagicLinkRequestDto {email}` | `202` (always; email sent only if client exists) |
| POST | `/portal/auth/magic-link/verify` | 🟢 + token | `MagicLinkVerifyDto {token}` | `200 AuthTokens` + refresh cookie |
| POST | `/portal/auth/login` | 🟢 | `LoginDto {email, password}` | `200 AuthTokens` (password clients only) |
| POST | `/portal/auth/refresh` | refresh cookie | — | `200 AuthTokens` + rotated cookie |
| POST | `/portal/auth/logout` | 🔵 | — | `204` |
| GET | `/portal/auth/me` | 🔵 | — | `200 ClientPrincipal {id, email, fullName}` |

**Domain errors:** `410 MAGIC_LINK_EXPIRED`, `409 MAGIC_LINK_CONSUMED`. Magic-link tokens are single-use, hashed, short-TTL (§4.3).

---

## 2. Users (`/admin/users`) — staff account management 🔴

| Method | Route | Perm | Request DTO | Success |
|---|---|---|---|---|
| GET | `/admin/users` | `user:read` | — | `200 Paginated<UserSummary>` |
| POST | `/admin/users` | `user:create` | `CreateUserDto {email, fullName, roleIds[]}` | `201 User` (sends invite; status `INVITED`) |
| GET | `/admin/users/:id` | `user:read` | — | `200 User` |
| PATCH | `/admin/users/:id` | `user:update` | `UpdateUserDto {fullName?, status?, solicitorId?}` | `200 User` |
| DELETE | `/admin/users/:id` | `user:delete` | — | `204` (soft delete; revokes all sessions) |
| POST | `/admin/users/:id/roles` | `user:manage-roles` | `AssignRoleDto {roleId, scopeType, scopeId?, expiresAt?}` | `201 RoleAssignment` |
| DELETE | `/admin/users/:id/roles/:assignmentId` | `user:manage-roles` | — | `204` |
| POST | `/admin/users/:id/suspend` | `user:update` | `SuspendUserDto {reason}` | `200 User` |
| POST | `/admin/users/:id/reactivate` | `user:update` | — | `200 User` |
| GET | `/admin/users/:id/sessions` | `user:read` | — | `200 SessionInfo[]` (device list) |
| DELETE | `/admin/users/:id/sessions` | `user:manage-roles` | — | `204` (force-logout everywhere — stolen device / termination) |

**List semantics** (`GET /admin/users`): cursor. **Filter** `status`, `roleId`. **Search** `q` over `fullName`, `email`. **Sort** `createdAt` (default `-createdAt`), `fullName`, `lastLoginAt`.
**Domain errors:** `409 EMAIL_ALREADY_EXISTS`, `409 CANNOT_DELETE_SELF`, `403 CANNOT_MODIFY_SUPER_ADMIN` (unless SUPER_ADMIN).

---

## 3. Roles & Permissions (`/admin/roles`) 🔴

| Method | Route | Perm | Request DTO | Success |
|---|---|---|---|---|
| GET | `/admin/roles` | `role:read` | — | `200 Role[]` (small set — unpaginated) |
| POST | `/admin/roles` | `role:create` | `CreateRoleDto {key, name, description, permissionIds[]}` | `201 Role` |
| GET | `/admin/roles/:id` | `role:read` | — | `200 Role {…, permissions[]}` |
| PATCH | `/admin/roles/:id` | `role:update` | `UpdateRoleDto {name?, description?}` | `200 Role` |
| PUT | `/admin/roles/:id/permissions` | `role:update` | `SetPermissionsDto {permissionIds[]}` | `200 Role` (full replace) |
| DELETE | `/admin/roles/:id` | `role:delete` | — | `204` |
| GET | `/admin/permissions` | `role:read` | — | `200 Permission[]` (catalog for the role editor) |

**Domain errors:** `409 ROLE_KEY_EXISTS`, `409 ROLE_IN_USE` (has assignments), `403 CANNOT_MODIFY_SYSTEM_ROLE` (`isSystem`).

---

## 4. Appointments / Bookings

Owns the strong-consistency write path (§6 `EXCLUDE`). Public booking, admin management, portal read.

### 4.1 Public — `/api/v1/public/*`

| Method | Route | Auth | Request | Success |
|---|---|---|---|---|
| GET | `/public/availability` | 🟢 | query (below) | `200 AvailabilityResult {date, timeZone, slots: TimeSlot[]}` |
| POST | `/public/bookings` | 🟢 + Idempotency-Key | `CreateBookingDto` | `201 BookingConfirmation {reference, manageToken, slot, solicitor, office, icsUrl}` |
| GET | `/public/bookings/manage/:manageToken` | 🔑 | — | `200 BookingManageView` |
| POST | `/public/bookings/manage/:manageToken/cancel` | 🔑 | `CancelBookingDto {reason?}` | `200 Booking` |
| POST | `/public/bookings/manage/:manageToken/reschedule` | 🔑 | `RescheduleBookingDto {slotStartUtc, slotEndUtc}` | `200 Booking` |

**`CreateBookingDto`:** `{ practiceAreaSlug, solicitorSlug, officeId, slotStartUtc, slotEndUtc, displayTimeZone, clientName, clientEmail, clientPhone, clientNotes?, honeypot?, renderedAtSignature }` — the render-timestamp is **HMAC-signed server-side** (appendix #5) so the anti-bot timing signal can't be forged.

**`GET /public/availability` query:** `solicitor` (slug), `service` (slug), `office` (id), `from` (date), `to` (date, ≤ 31-day span), `timeZone` (IANA). No pagination (bounded by date span). Read-only, CDN-cacheable, but invalidated on booking write (§18 hot-path cache).

**Domain errors:** `409 SLOT_NO_LONGER_AVAILABLE`, `422 OUTSIDE_NOTICE_WINDOW`, `422 OUTSIDE_BOOKING_WINDOW`, `422 SPAM_REJECTED`, `404` (uniform on a bad/expired `manageToken` — never reveals existence, §4.1).

**Note:** there is **no reminders endpoint** — the Vercel `/api/cron/reminders` route is deleted; reminders are a BullMQ repeatable job with claim-before-send (§8, appendix #4).

### 4.2 Admin — `/api/v1/admin/bookings` 🔴

| Method | Route | Perm | Request | Success |
|---|---|---|---|---|
| GET | `/admin/bookings` | `booking:read` | query (below) | `200 Paginated<BookingSummary>` |
| GET | `/admin/bookings/:id` | `booking:read` | — | `200 Booking` |
| POST | `/admin/bookings` | `booking:create` | `AdminCreateBookingDto` | `201 Booking` (staff-created; may attach `clientId`) |
| PATCH | `/admin/bookings/:id` | `booking:update` | `UpdateBookingDto {status?, clientNotes?}` | `200 Booking` |
| POST | `/admin/bookings/:id/cancel` | `booking:cancel` | `CancelBookingDto {reason}` | `200 Booking` |
| POST | `/admin/bookings/:id/reschedule` | `booking:update` | `RescheduleBookingDto` | `200 Booking` |

**List semantics:** cursor. **Filter** `status`, `solicitorId`, `officeId`, `practiceAreaId`, `from`/`to` (slot date range), `clientEmail`. **Search** `q` over `clientName`, `clientEmail`, `reference`. **Sort** `slotStartUtc` (default `-slotStartUtc`), `createdAt`, `status`.
**Domain errors:** same as public + `409 SLOT_NO_LONGER_AVAILABLE` on reschedule.

### 4.3 Portal — `/api/v1/portal/bookings` 🔵

| Method | Route | Request | Success |
|---|---|---|---|
| GET | `/portal/bookings` | query `status?`, `from?`, `to?` | `200 Paginated<BookingSummary>` (scoped `clientId=self`) |
| GET | `/portal/bookings/:id` | — | `200 Booking` (404 if not the client's — uniform) |

**List semantics:** cursor. **Sort** `-slotStartUtc` default. Scope is enforced in the `where` clause (CASL), not a post-fetch check.

---

## 5. Contact / Enquiries

Public write (spam-guarded), staff read/triage.

### 5.1 Public — `/api/v1/public/contact` 🟢

| Method | Route | Auth | Request | Success |
|---|---|---|---|---|
| POST | `/public/contact` | 🟢 + Idempotency-Key | `CreateEnquiryDto {name, email, phone?, subject?, message, practiceAreaSlug?, honeypot?, renderedAtSignature}` | `202 EnquiryAck {reference}` |

**Domain errors:** `422 SPAM_REJECTED` (honeypot + HMAC-signed timing + Redis rate limit). `ipAddress`/`userAgent` captured server-side for spam analysis (short retention, §6).

### 5.2 Admin — `/api/v1/admin/enquiries` 🔴

| Method | Route | Perm | Request | Success |
|---|---|---|---|---|
| GET | `/admin/enquiries` | `enquiry:read` | query (below) | `200 Paginated<EnquirySummary>` |
| GET | `/admin/enquiries/:id` | `enquiry:read` | — | `200 Enquiry` |
| PATCH | `/admin/enquiries/:id` | `enquiry:update` | `UpdateEnquiryDto {status?, assignedToId?}` | `200 Enquiry` |
| POST | `/admin/enquiries/:id/assign` | `enquiry:update` | `AssignEnquiryDto {assignedToId}` | `200 Enquiry` |
| DELETE | `/admin/enquiries/:id` | `enquiry:delete` | — | `204` (soft delete) |

**List semantics:** cursor. **Filter** `status`, `assignedToId`, `practiceAreaId`, `source`, `from`/`to`. **Search** `q` over `name`, `email`, `subject`, `message`. **Sort** `-createdAt` (default), `status`.

---

## 6. Practice Areas

Public read, admin CRUD. (DB model: `PracticeArea` = the domain's `Service`.)

### 6.1 Public — `/api/v1/public/practice-areas` 🟢

| Method | Route | Success |
|---|---|---|
| GET | `/public/practice-areas` | `200 PracticeAreaSummary[]` (published, ordered by `displayOrder`) |
| GET | `/public/practice-areas/:slug` | `200 PracticeArea` (with SEO metadata + assigned solicitors) |

Small set → unpaginated; sorted by `displayOrder`. CDN-cacheable.

### 6.2 Admin — `/api/v1/admin/practice-areas` 🔴

| Method | Route | Perm | Request | Success |
|---|---|---|---|---|
| GET | `/admin/practice-areas` | `content:read` | `?status`, `?includeDeleted`, `?q` | `200 Paginated<PracticeArea>` |
| POST | `/admin/practice-areas` | `content:create` | `CreatePracticeAreaDto {slug, title, summary, description, durationMinutes, iconMediaId?, heroImageId?}` | `201 PracticeArea` |
| GET | `/admin/practice-areas/:id` | `content:read` | — | `200 PracticeArea` |
| PATCH | `/admin/practice-areas/:id` | `content:update` | `UpdatePracticeAreaDto` (all optional) | `200 PracticeArea` |
| DELETE | `/admin/practice-areas/:id` | `content:delete` | — | `204` (soft delete) |
| POST | `/admin/practice-areas/:id/publish` | `content:publish` | — | `200 PracticeArea` (triggers ISR revalidation, §18) |
| POST | `/admin/practice-areas/:id/unpublish` | `content:publish` | — | `200 PracticeArea` |
| PUT | `/admin/practice-areas/reorder` | `content:update` | `ReorderDto {orderedIds[]}` | `204` |

**Search** `q` over `title`, `slug`. **Sort** `displayOrder` (default), `title`, `updatedAt`.
**Domain errors:** `409 SLUG_EXISTS`, `409 PRACTICE_AREA_IN_USE` (referenced by active bookings) on delete.

> The publish/reorder/slug/soft-delete pattern below repeats for **every CMS resource** (solicitors, offices, blog, FAQ, reviews, homepage). Documented once here; per-module tables show only the deltas.

---

## 7. Solicitors

### 7.1 Public — `/api/v1/public/solicitors` 🟢

| Method | Route | Success |
|---|---|---|
| GET | `/public/solicitors` | `200 SolicitorSummary[]` (published, `displayOrder`) — `?practiceArea=<slug>`, `?office=<id>` filters |
| GET | `/public/solicitors/:slug` | `200 Solicitor` (bio, qualifications, practice areas, offices, SEO) |

### 7.2 Admin — `/api/v1/admin/solicitors` 🔴

| Method | Route | Perm | Request | Success |
|---|---|---|---|---|
| GET | `/admin/solicitors` | `content:read` | `?status`, `?q` | `200 Paginated<Solicitor>` |
| POST | `/admin/solicitors` | `content:create` | `CreateSolicitorDto {slug, name, role, imageId?, bio, qualifications[], memberships[], languages[], experienceYears, email}` | `201 Solicitor` |
| GET | `/admin/solicitors/:id` | `content:read` | — | `200 Solicitor` |
| PATCH | `/admin/solicitors/:id` | `content:update` | `UpdateSolicitorDto` | `200 Solicitor` |
| DELETE | `/admin/solicitors/:id` | `content:delete` | — | `204` |
| POST | `/admin/solicitors/:id/publish` · `/unpublish` | `content:publish` | — | `200 Solicitor` |
| PUT | `/admin/solicitors/:id/practice-areas` | `content:update` | `SetRelationDto {ids[]}` | `200` (replaces M:N) |
| PUT | `/admin/solicitors/:id/offices` | `content:update` | `SetRelationDto {ids[]}` | `200` |
| PUT | `/admin/solicitors/:id/working-hours` | `content:update` | `WorkingHoursDto` (per-day `{start,end}`) | `200 Solicitor` |
| PUT | `/admin/solicitors/reorder` | `content:update` | `ReorderDto` | `204` |

**Search** `q` over `name`, `role`, `email`. **Sort** `displayOrder` (default), `name`, `experienceYears`.
**Domain errors:** `409 SLUG_EXISTS`, `409 SOLICITOR_HAS_BOOKINGS` on delete (guides to reassign first).

---

## 8. Reviews

Public read + moderation queue (future client submission, §2.2).

### 8.1 Public — `/api/v1/public/*` 🟢

| Method | Route | Auth | Request | Success |
|---|---|---|---|---|
| GET | `/public/reviews` | 🟢 | query (below) | `200 Paginated<Review>` (status `APPROVED` only) |
| GET | `/public/reviews/stats` | 🟢 | `?practiceArea?` | `200 ReviewStats {average, total, distribution{1..5}}` (from materialized view) |
| POST | `/public/reviews/:id/helpful` | 🟢 + Idempotency-Key | — | `200 {helpfulCount}` (rate-limited per-IP) |
| GET | `/public/video-testimonials` | 🟢 | — | `200 VideoTestimonial[]` (published, ordered) |
| POST | `/portal/reviews` | 🔵 | `SubmitReviewDto {rating, title?, body, practiceAreaId?}` | `201 Review` (status `PENDING` → moderation) |

**List semantics** (`GET /public/reviews`): cursor. **Filter** `practiceArea` (slug), `source`, `rating`, `featured`, `verified`. **Search** none. **Sort** `-reviewDate` (default), `-rating`, `-helpfulCount`, `-featured` (multi-key allowed).

### 8.2 Admin — `/api/v1/admin/reviews` 🔴

| Method | Route | Perm | Request | Success |
|---|---|---|---|---|
| GET | `/admin/reviews` | `review:read` | `?status`, `?source`, `?q` | `200 Paginated<Review>` (all statuses) |
| POST | `/admin/reviews` | `review:create` | `CreateReviewDto` | `201 Review` (manual entry, e.g. imported Google) |
| PATCH | `/admin/reviews/:id` | `review:update` | `UpdateReviewDto` | `200 Review` |
| POST | `/admin/reviews/:id/approve` · `/reject` | `review:moderate` | — | `200 Review` |
| POST | `/admin/reviews/:id/feature` · `/unfeature` | `review:update` | — | `200 Review` |
| DELETE | `/admin/reviews/:id` | `review:delete` | — | `204` |
| POST | `/admin/video-testimonials` (+ `:id` PATCH/DELETE, `/reorder`) | `review:update` | `VideoTestimonialDto` | `201/200/204` |

**Search** `q` over `authorName`, `body`. **Sort** `-createdAt` (default), `rating`, `status`.

---

## 9. FAQ (`/faqs`)

### 9.1 Public 🟢
`GET /public/faqs` → `200 Faq[]` (published, `displayOrder`). **Filter** `?practiceArea=<slug>` (or general when omitted). Small set → unpaginated.

### 9.2 Admin — `/api/v1/admin/faqs` 🔴

| Method | Route | Perm | Request | Success |
|---|---|---|---|---|
| GET | `/admin/faqs` | `content:read` | `?practiceAreaId`, `?q`, `?status` | `200 Paginated<Faq>` |
| POST | `/admin/faqs` | `content:create` | `CreateFaqDto {question, answer, practiceAreaId?}` | `201 Faq` |
| PATCH | `/admin/faqs/:id` | `content:update` | `UpdateFaqDto` | `200 Faq` |
| DELETE | `/admin/faqs/:id` | `content:delete` | — | `204` |
| POST | `/admin/faqs/:id/publish` · `/unpublish` | `content:publish` | — | `200 Faq` |
| PUT | `/admin/faqs/reorder` | `content:update` | `ReorderDto` | `204` |

**Search** `q` over `question`, `answer`. **Sort** `displayOrder` (default), `updatedAt`.

---

## 10. Blog

Public reads use **offset pagination** (SEO — §0.3, §3). Admin CRUD for posts, categories, tags, authors.

### 10.1 Public — `/api/v1/public/blog/*` 🟢

| Method | Route | Request | Success |
|---|---|---|---|
| GET | `/public/blog/posts` | `?page`, `?pageSize`, `?category`, `?tag`, `?author`, `?q` | `200 OffsetPaginated<PostSummary>` (published, `publishedAt <= now`) |
| GET | `/public/blog/posts/:slug` | — | `200 Post` (body blocks, author, category, tags, readingTime, SEO) |
| GET | `/public/blog/categories` | — | `200 BlogCategory[]` |
| GET | `/public/blog/categories/:slug/posts` | `?page`, `?pageSize` | `200 OffsetPaginated<PostSummary>` |
| GET | `/public/blog/tags` | — | `200 BlogTag[]` |
| GET | `/public/blog/authors/:slug` | — | `200 BlogAuthor` (+ their published posts) |

**List semantics** (`/public/blog/posts`): offset. **Filter** `category` (slug), `tag` (slug), `author` (slug). **Search** `q` over `title`, `excerpt`, `body` (Postgres FTS). **Sort** `-publishedAt` (default), `title`.

### 10.2 Admin — `/api/v1/admin/blog/*` 🔴

| Method | Route | Perm | Request | Success |
|---|---|---|---|---|
| GET | `/admin/blog/posts` | `content:read` | `?status`, `?category`, `?author`, `?q` | `200 Paginated<PostSummary>` (cursor; all statuses) |
| POST | `/admin/blog/posts` | `content:create` | `CreatePostDto {slug, title, excerpt, coverImageId?, categoryId, authorId, body, tagIds[]}` | `201 Post` (status `DRAFT`) |
| GET | `/admin/blog/posts/:id` | `content:read` | — | `200 Post` |
| PATCH | `/admin/blog/posts/:id` | `content:update` | `UpdatePostDto` | `200 Post` |
| DELETE | `/admin/blog/posts/:id` | `content:delete` | — | `204` |
| POST | `/admin/blog/posts/:id/publish` | `content:publish` | `PublishDto {publishedAt?}` (future = schedule) | `200 Post` (triggers ISR) |
| POST | `/admin/blog/posts/:id/unpublish` | `content:publish` | — | `200 Post` |
| GET | `/admin/blog/posts/:id/preview` | `content:read` | — | `200 Post` (draft preview — renders unpublished) |
| — | `/admin/blog/categories`, `/admin/blog/tags`, `/admin/blog/authors` | `content:*` | CRUD (same shape) | |

**Search** `q` over `title`, `excerpt`. **Sort** `-updatedAt` (default), `publishedAt`, `status`.
**Domain errors:** `409 SLUG_EXISTS`, `409 CATEGORY_HAS_POSTS` on category delete.

---

## 11. Homepage (`/homepage`)

### 11.1 Public 🟢
`GET /public/homepage` → `200 HomepageContent {sections: HomepageSection[], values: FirmValue[], stats: FirmStat[]}` — one aggregate call, published items only, all `displayOrder`-sorted. Heavily CDN-cached; invalidated on any homepage publish.

### 11.2 Admin — `/api/v1/admin/homepage/*` 🔴

| Method | Route | Perm | Request | Success |
|---|---|---|---|---|
| GET | `/admin/homepage/sections` | `content:read` | — | `200 HomepageSection[]` |
| PATCH | `/admin/homepage/sections/:id` | `content:update` | `UpdateSectionDto {title?, subtitle?, content?, isPublished?}` | `200 HomepageSection` |
| PUT | `/admin/homepage/sections/reorder` | `content:update` | `ReorderDto` | `204` |
| GET·POST·PATCH·DELETE | `/admin/homepage/values` (+ `:id`, `/reorder`) | `content:*` | `FirmValueDto {title, description, iconPath?}` | `200/201/204` |
| GET·POST·PATCH·DELETE | `/admin/homepage/stats` (+ `:id`, `/reorder`) | `content:*` | `FirmStatDto {label, value, suffix?}` | `200/201/204` |

All small sets → unpaginated; ordered by `displayOrder`. No search.

---

## 12. Office Locations (`/offices`)

### 12.1 Public 🟢
`GET /public/offices` → `200 Office[]`; `GET /public/offices/:slug` → `200 Office` (structured address, geo, opening hours, SEO/`LocalBusiness` JSON-LD source). Unpaginated.

### 12.2 Admin — `/api/v1/admin/offices` 🔴

| Method | Route | Perm | Request | Success |
|---|---|---|---|---|
| GET | `/admin/offices` | `content:read` | `?q` | `200 Paginated<Office>` |
| POST | `/admin/offices` | `content:create` | `CreateOfficeDto {slug, name, addressLine1, addressLine2?, city, postcode, country, timeZone, latitude?, longitude?, phone?, email?, openingHours}` | `201 Office` |
| PATCH | `/admin/offices/:id` | `content:update` | `UpdateOfficeDto` | `200 Office` |
| DELETE | `/admin/offices/:id` | `content:delete` | — | `204` |
| POST | `/admin/offices/:id/publish` · `/unpublish` | `content:publish` | — | `200 Office` |
| PUT | `/admin/offices/reorder` | `content:update` | `ReorderDto` | `204` |

**Search** `q` over `name`, `city`, `postcode`. **Sort** `displayOrder` (default), `name`.
**Domain errors:** `409 OFFICE_HAS_BOOKINGS`/`OFFICE_HAS_SOLICITORS` on delete.

---

## 13. Media (`/admin/media`) 🔴

Public assets only (§7). Uploads go **direct to storage via pre-signed PUT** — the API never proxies bytes.

| Method | Route | Perm | Request | Success |
|---|---|---|---|---|
| POST | `/admin/media/uploads` | `media:create` | `RequestUploadDto {filename, mimeType, byteSize}` | `201 UploadTicket {mediaId, uploadUrl, fields, expiresIn}` — row created `PENDING`, ≈5-min TTL PUT (§7) |
| POST | `/admin/media/:id/complete` | `media:create` | — | `200 MediaAsset` (verifies object landed; enqueues variant generation) |
| GET | `/admin/media` | `media:read` | query (below) | `200 Paginated<MediaAsset>` |
| GET | `/admin/media/:id` | `media:read` | — | `200 MediaAsset {…, variants[]}` |
| PATCH | `/admin/media/:id` | `media:update` | `UpdateMediaDto {altText?, caption?, title?}` | `200 MediaAsset` |
| DELETE | `/admin/media/:id` | `media:delete` | — | `204` (soft delete) |

**List semantics:** cursor. **Filter** `mimeType` (prefix, e.g. `image/`). **Search** `q` over `filename`, `altText`, `title`. **Sort** `-createdAt` (default), `filename`, `byteSize`.
**Domain errors:** `413 FILE_TOO_LARGE`, `415 UNSUPPORTED_MEDIA_TYPE` (validated by magic bytes on completion, never `Content-Type`, §12), `409 MEDIA_IN_USE` on delete (referenced by content).

---

## 14. Settings (`/admin/settings`) 🔴

Firm-wide config, SEO overrides, and retention policy.

| Method | Route | Perm | Request | Success |
|---|---|---|---|---|
| GET | `/admin/settings` | `settings:read` | — | `200 FirmSettings {name, contact, socialLinks, defaultSeo, features{}}` |
| PATCH | `/admin/settings` | `settings:update` | `UpdateSettingsDto` | `200 FirmSettings` |
| GET | `/admin/seo` | `settings:read` | `?routePath` **or** `?ownerType&ownerId` | `200 SeoMetadata` |
| PUT | `/admin/seo` | `settings:update` | `UpsertSeoDto {routePath?|ownerType+ownerId, title, description, canonicalUrl?, og…, robots?, keywords[], jsonLd?}` | `200 SeoMetadata` (triggers ISR for the affected route) |
| GET | `/admin/settings/retention` | `settings:read` | — | `200 RetentionPolicy[]` |
| PATCH | `/admin/settings/retention/:id` | `settings:update` | `UpdateRetentionDto {retentionPeriod, dispositionAction, isActive}` | `200 RetentionPolicy` |

No pagination (small, fixed sets). **Domain errors:** `422 INVALID_RETENTION` (period below a legal-minimum floor).

---

## 15. Notifications

Admin delivery log + templates, portal read, consent capture, and the provider webhook.

### 15.1 Admin — `/api/v1/admin/notifications` 🔴

| Method | Route | Perm | Request | Success |
|---|---|---|---|---|
| GET | `/admin/notifications` | `notification:read` | query (below) | `200 Paginated<Notification>` |
| GET | `/admin/notifications/:id` | `notification:read` | — | `200 Notification {…, events[]}` |
| POST | `/admin/notifications/:id/resend` | `notification:send` | — | `202` (re-enqueues via outbox) |
| GET·POST·PATCH | `/admin/notification-templates` (+ `:id`) | `notification:manage` | `TemplateDto {key, channel, category, subject?, bodyTemplate?, locale}` | `200/201` |

**List semantics:** cursor. **Filter** `status`, `channel`, `category`, `clientId`, `bookingId`, `from`/`to`. **Search** `q` over `recipientEmail`, `subject`. **Sort** `-createdAt` (default), `status`.

### 15.2 Portal — `/api/v1/portal/notifications` 🔵
`GET /portal/notifications` → `200 Paginated<NotificationSummary>` (scoped `clientId=self`, cursor, `-createdAt`).

### 15.3 Consent & unsubscribe (PECR/GDPR — §9, §13) 🟢

| Method | Route | Auth | Request | Success |
|---|---|---|---|---|
| POST | `/public/consent` | 🟢 | `ConsentDto {email, channel, purpose, consentGiven, source}` | `202` (appends to consent ledger) |
| GET | `/public/unsubscribe/:token` | 🟢 + token | — | `200` (one-click marketing opt-out; honoured server-side, not banner theatre) |

**Domain errors:** `410 UNSUBSCRIBE_TOKEN_EXPIRED`.

### 15.4 Webhooks — `/api/v1/webhooks/*`

| Method | Route | Auth | Success |
|---|---|---|---|
| POST | `/webhooks/notifications/:provider` | signature verification (Resend/Twilio) | `200` — records delivery/bounce/complaint → `NotificationEvent`, updates `Notification.status` |

Signature-verified, idempotent (provider event id dedupes), replay-safe (§8). Never trusts the body without verifying the signature.

---

## 16. Audit Log (`/admin/audit`) 🔴 — bonus, referenced by §5/§10

Not in the module list, but the permission `audit:read` exists and the compliance story needs a read surface. Append-only — **no write/update/delete endpoints** by design.

| Method | Route | Perm | Request | Success |
|---|---|---|---|---|
| GET | `/admin/audit` | `audit:read` | query (below) | `200 Paginated<AuditLogEntry>` |
| GET | `/admin/audit/:id` | `audit:read` | — | `200 AuditLogEntry` |

**List semantics:** cursor (over UUIDv7 `id` ≈ time order). **Filter** `actorId`, `actorType`, `action`, `resourceType`, `resourceId`, `outcome`, `from`/`to`. **Search** none (structured only). **Sort** `-occurredAt` (default). Restricted to a small set of principals (§10).

---

## Appendix A — Response models (shared)

| Model | Key fields |
|---|---|
| `AuthTokens` | `accessToken, tokenType:"Bearer", expiresIn, principal` |
| `StaffPrincipal` | `id, email, fullName, roles[], permissions[]` |
| `ClientPrincipal` | `id, email, fullName` |
| `TimeSlot` | `startUtc, endUtc, available` |
| `BookingConfirmation` | `reference, manageToken (once, at creation), slot, solicitor, office, icsUrl` |
| `Booking` | `id, reference, status, practiceArea, solicitor, office, slotStartUtc, slotEndUtc, displayTimeZone, client{name,email,phone}, clientNotes, createdAt` — `manageToken` **never** returned after creation |
| `Paginated<T>` | `{ data: T[], pageInfo: { nextCursor, hasNextPage } }` |
| `OffsetPaginated<T>` | `{ data: T[], pagination: { page, pageSize, total, totalPages } }` |
| `ReviewStats` | `average, total, distribution{1..5}` |
| `Problem` (error) | `type, title, status, code, detail, fieldErrors, traceId` |

DTO field-level rules (min/max/format) are defined once in `packages/contracts` (Zod) and flow to validation + Swagger + frontend types (§0, §12) — not duplicated here.

## Appendix B — Cross-cutting guarantees

- **Deny by default:** a global guard requires auth + permission; public routes opt out with `@Public()`. A forgotten guard fails **closed** (§5).
- **Idempotency** on the marked POSTs; **reuse-detection** on refresh tokens; **claim-before-send** semantics behind the (non-public) reminder job.
- **Uniform 404** everywhere for "not found or not yours" — no oracle for enumeration (§5).
- **ISR revalidation** fires on every CMS publish/unpublish/reorder + SEO change (§18) — the reason those verbs are explicit endpoints, not just `PATCH isPublished`.
- **OpenAPI** generated from the same Zod schemas and **snapshot-diffed in CI** (§12/§16) — a breaking contract change shows up in review.
