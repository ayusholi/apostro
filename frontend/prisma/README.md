# Connecting Postgres (and the other adapters)

The booking system is built so every external dependency — the database,
the email provider, the rate limiter, calendar sync — sits behind an
interface defined in `src/application/booking/ports.ts`. Today, every one of
those interfaces has a development adapter (in-memory, console-logging).
Swapping any of them means writing one new class and changing one line in
`src/infrastructure/container.ts` — no use case, Server Action, or
component ever imports a concrete adapter directly.

## 1. Postgres (`BookingRepository` + the three catalog repositories)

1. `npm install prisma @prisma/client`
2. `npx prisma migrate dev --name init` (uses `prisma/schema.prisma`, already written to match the domain entities field-for-field)
3. Seed `Service`, `Office`, `Solicitor`, `SolicitorService`, `SolicitorOffice` from the current `src/data/*.ts` files — those files can then be deleted, or kept as the seed script's source.
4. Implement `src/infrastructure/booking/postgres/PrismaBookingRepository.ts` against the `BookingRepository` interface. The one thing to get right that the in-memory adapter fakes:
   - **`createIfSlotFree`** — the in-memory version checks-then-inserts in one synchronous step, which is safe only because JS is single-threaded per request. Postgres needs either:
     - a `SERIALIZABLE` transaction wrapping the overlap check + insert, or
     - (recommended) a real DB-level guarantee: an `EXCLUDE` constraint using the `btree_gist` extension over `(solicitor_slug, tstzrange(slot_start_utc, slot_end_utc))`, added as a raw-SQL migration alongside the Prisma schema. This makes double-booking impossible even under concurrent requests, which an application-level check alone can't guarantee.
   - **`rescheduleIfSlotFree`** — same constraint covers this: attempt the `UPDATE`, catch the constraint-violation error, return `false`.
5. Implement the three catalog repositories (`ServiceRepository`, `SolicitorRepository`, `OfficeRepository`) as thin Prisma queries — straightforward reads, no concurrency concerns.
6. In `container.ts`, replace:
   ```ts
   const bookings = new InMemoryBookingRepository();
   // ...
   const services = new StaticServiceRepository();
   const solicitors = new StaticSolicitorRepository();
   const offices = new StaticOfficeRepository();
   ```
   with the Prisma-backed equivalents. Everything above the composition root is unaffected.

## 2. Real email delivery (`NotificationService`)

`ConsoleNotificationService` logs instead of sending. Recommended swap:
[Resend](https://resend.com) — first-class Next.js support, simple API, generous free tier.

```ts
// src/infrastructure/booking/notifications/ResendNotificationService.ts
import { Resend } from "resend";
import type { EmailMessage, NotificationService } from "@/application/booking/ports";

export class ResendNotificationService implements NotificationService {
  private readonly resend = new Resend(process.env.RESEND_API_KEY);

  async send(message: EmailMessage): Promise<void> {
    await this.resend.emails.send({
      from: "ALLS <hello@alls.law>",
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
      attachments: message.attachments?.map((a) => ({ filename: a.filename, content: a.content })),
    });
  }
}
```

Swap the one line in `container.ts`. Every email's actual content (subject/html/text/attachments) is already fully composed in `src/application/booking/emailComposer.ts` — this adapter only has to transport it.

## 3. Rate limiting at scale (`SpamGuard`'s limiter)

`InMemoryRateLimiter` only shares state within one Node process. Fine for a
single long-running server; **not** fine once deployed across multiple
serverless instances (each gets its own memory, so the "5 attempts per 15
minutes" limit becomes "5 attempts per instance"). Swap for a Redis-backed
limiter (e.g. [Upstash](https://upstash.com) + `@upstash/ratelimit`, which has
the exact same `consume(key, now)` shape) inside `HoneypotSpamGuard`.

## 4. Real Google Calendar / Outlook sync

What's built today: a downloadable `.ics` file and one-click "Add to Google
Calendar" / "Add to Outlook" links (`src/domain/scheduling/ics.ts` and
`calendarLinks.ts`) — no OAuth, works for anyone, right now.

A real two-way sync (writing directly into a client's connected calendar,
detecting if they've since deleted the event, etc.) needs:
- A registered OAuth app with Google (Calendar API) and/or Microsoft (Graph API for Outlook)
- A client secret and a consent screen the client completes once
- A place to store the resulting refresh token per client — which itself needs the Postgres swap done first

None of that can exist without a live, publicly reachable deployment and
real registered credentials, so it isn't built here. If it's wanted later,
it's additive: a `CalendarSyncService` port alongside the existing ones,
implemented against `googleapis` / `@microsoft/microsoft-graph-client`,
called from `createBooking`/`cancelBooking`/`rescheduleBooking` the same way
`NotificationService` is today.

## 5. Reviews (`ReviewRepository` + `VideoTestimonialRepository`)

Same shape as the booking swap: `src/application/reviews/ports.ts` defines
`ReviewRepository`/`VideoTestimonialRepository`, `StaticReviewRepository` and
`StaticVideoTestimonialRepository` (in `src/infrastructure/reviews/memory/`)
read from `src/data/reviews.ts`/`videoTestimonials.ts` today, and everything
above them — `listReviews`/`listVideoTestimonials` use cases, every component
under `src/components/reviews/` — only ever sees the interfaces.

1. Seed the `Review` and `VideoTestimonial` tables from the current data files.
2. Implement `PrismaReviewRepository`/`PrismaVideoTestimonialRepository`
   against the two interfaces — both are read-only `listAll()` calls today,
   so this is a straightforward Prisma query, no concurrency concerns.
3. In `src/infrastructure/reviewsContainer.ts`, replace the two
   `new Static*Repository()` lines with the Prisma-backed equivalents.
4. If reviews later need to be submitted by real clients (not just seeded),
   add a `createReview` use case + Server Action mirroring
   `createBooking`'s shape, gated behind the same `SpamGuard` port the
   booking form already uses — no new spam-protection code needed.
5. The Google Reviews section renders the same seed data filtered to
   `source: "google"` — it is not a live Google Places API integration (no
   API key is configured). To make it live: call the Places API
   `place/details` endpoint server-side (cache the response — Google's terms
   cap how often you may poll), map its `reviews[]` into the `Review` shape,
   and feed that into `StaticReviewRepository` or a new
   `GooglePlacesReviewRepository` composed alongside it.

## 6. Reminders cron

`src/app/api/cron/reminders/route.ts` is already a real, working endpoint —
it calls the same `sendDueReminders` use case regardless of what's behind
`BookingRepository`. Set `CRON_SECRET` in the deployment's environment
variables and Vercel Cron (configured in `/vercel.json`, hourly) will
authenticate automatically. Any other scheduler (a GitHub Actions cron, a
traditional crontab hitting the URL with `curl -H "Authorization: Bearer $CRON_SECRET"`) works identically.
