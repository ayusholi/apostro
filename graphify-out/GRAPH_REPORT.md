# Graph Report - .  (2026-07-16)

## Corpus Check
- 173 files · ~356,525 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 921 nodes · 2236 edges · 57 communities (51 shown, 6 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 31 edges (avg confidence: 0.74)
- Token cost: 58,170 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Route Metadata & Parsing|Route Metadata & Parsing]]
- [[_COMMUNITY_Cases & Legal Pages|Cases & Legal Pages]]
- [[_COMMUNITY_Booking DTOs & Results|Booking DTOs & Results]]
- [[_COMMUNITY_Attorneys Page Routing|Attorneys Page Routing]]
- [[_COMMUNITY_Marketing Page Content|Marketing Page Content]]
- [[_COMMUNITY_Legal Compliance Pages|Legal Compliance Pages]]
- [[_COMMUNITY_Booking Repository Interface|Booking Repository Interface]]
- [[_COMMUNITY_Solicitor Repository & Catalog|Solicitor Repository & Catalog]]
- [[_COMMUNITY_Booking Email Composer|Booking Email Composer]]
- [[_COMMUNITY_Footer, Manifest & Regulatory Info|Footer, Manifest & Regulatory Info]]
- [[_COMMUNITY_About & FAQ Pages|About & FAQ Pages]]
- [[_COMMUNITY_Project Dependencies|Project Dependencies]]
- [[_COMMUNITY_Root Layout & Cookie Consent|Root Layout & Cookie Consent]]
- [[_COMMUNITY_Sitemap & Blog Cards|Sitemap & Blog Cards]]
- [[_COMMUNITY_TypeScript Config|TypeScript Config]]
- [[_COMMUNITY_Blog Listing Page|Blog Listing Page]]
- [[_COMMUNITY_Blog Ports & Article Hero|Blog Ports & Article Hero]]
- [[_COMMUNITY_Core Ports (Clock, Email)|Core Ports (Clock, Email)]]
- [[_COMMUNITY_Booking Server Actions|Booking Server Actions]]
- [[_COMMUNITY_Blog Article Page|Blog Article Page]]
- [[_COMMUNITY_Services Page|Services Page]]
- [[_COMMUNITY_Next.js Breaking-Changes Warning|Next.js Breaking-Changes Warning]]
- [[_COMMUNITY_Booking Wizard UI|Booking Wizard UI]]
- [[_COMMUNITY_Blog Author DTOs|Blog Author DTOs]]
- [[_COMMUNITY_Cron Route & Book Page|Cron Route & Book Page]]
- [[_COMMUNITY_Solicitor Availability Scheduling|Solicitor Availability Scheduling]]
- [[_COMMUNITY_Office Repository|Office Repository]]
- [[_COMMUNITY_Booking Result Helpers|Booking Result Helpers]]
- [[_COMMUNITY_Spam Guard (Honeypot)|Spam Guard (Honeypot)]]
- [[_COMMUNITY_Google Places Reviews (proposed)|Google Places Reviews (proposed)]]
- [[_COMMUNITY_Blog Author Profile Page|Blog Author Profile Page]]
- [[_COMMUNITY_Marketing Layout & NavBar|Marketing Layout & NavBar]]
- [[_COMMUNITY_Booking DateTime Steps|Booking Date/Time Steps]]
- [[_COMMUNITY_Ports & Adapters Architecture|Ports & Adapters Architecture]]
- [[_COMMUNITY_Blog Post Detail & Policy|Blog Post Detail & Policy]]
- [[_COMMUNITY_Booking Management & Calendar Export|Booking Management & Calendar Export]]
- [[_COMMUNITY_Service Detail Page|Service Detail Page]]
- [[_COMMUNITY_Domain Entities & Seed Data|Domain Entities & Seed Data]]
- [[_COMMUNITY_Contact Page|Contact Page]]
- [[_COMMUNITY_Booking Reminder Cron Job|Booking Reminder Cron Job]]
- [[_COMMUNITY_Button UI Component|Button UI Component]]
- [[_COMMUNITY_Calendar Sync Integrations (proposed)|Calendar Sync Integrations (proposed)]]
- [[_COMMUNITY_Booking Creation & Rate Limiting|Booking Creation & Rate Limiting]]
- [[_COMMUNITY_ID Generator|ID Generator]]
- [[_COMMUNITY_Booking Validation Schemas|Booking Validation Schemas]]
- [[_COMMUNITY_Slot Concurrency Safety|Slot Concurrency Safety]]
- [[_COMMUNITY_Calendar UI Component|Calendar UI Component]]
- [[_COMMUNITY_Timezone Detection Hook|Timezone Detection Hook]]
- [[_COMMUNITY_Font Configuration|Font Configuration]]
- [[_COMMUNITY_ESLint Config|ESLint Config]]
- [[_COMMUNITY_Next.js Config|Next.js Config]]
- [[_COMMUNITY_Next.js Env Types|Next.js Env Types]]
- [[_COMMUNITY_Calendar Links & ICS|Calendar Links & ICS]]
- [[_COMMUNITY_Vercel Cron Config|Vercel Cron Config]]

## God Nodes (most connected - your core abstractions)
1. `breadcrumbList()` - 37 edges
2. `siteConfig` - 23 edges
3. `SiteHeader()` - 22 edges
4. `DomainError` - 18 edges
5. `Booking` - 17 edges
6. `Review` - 17 edges
7. `compilerOptions` - 16 edges
8. `BookingRepository` - 16 edges
9. `Post` - 15 edges
10. `SolicitorRepository` - 14 edges

## Surprising Connections (you probably didn't know these)
- `Testimonials — Hear From Our People` --semantically_similar_to--> `Recent Case Studies (by practice tag)`  [INFERRED] [semantically similar]
  index.html → cases.html
- `Legal Insight Articles Grid` --semantically_similar_to--> `Client FAQ Answers (6 items)`  [INFERRED] [semantically similar]
  blog.html → faq.html
- `allsolicitors (project README)` --references--> `Home Page (ALLS Landing)`  [INFERRED]
  README.md → index.html
- `About ALLS — Delivering Results with Integrity` --conceptually_related_to--> `About Us Page`  [INFERRED]
  index.html → about.html
- `About Us Page` --shares_data_with--> `Why Choose Us / Firm Stats`  [INFERRED]
  about.html → index.html

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Booking Repository Adapter Swap** — web_prisma_readme_bookingrepository, web_prisma_readme_inmemorybookingrepository, web_prisma_readme_prismabookingrepository, web_prisma_readme_container_ts [INFERRED 0.80]
- **Notification Service Adapter Swap** — web_prisma_readme_notificationservice, web_prisma_readme_consolenotificationservice, web_prisma_readme_resendnotificationservice, web_prisma_readme_container_ts [INFERRED 0.80]
- **Rate Limiter Adapter Swap** — web_prisma_readme_spamguard, web_prisma_readme_honeypotspamguard, web_prisma_readme_inmemoryratelimiter, web_prisma_readme_upstash_ratelimit [INFERRED 0.80]
- **Docs-First Agent Safety Pattern (warning + directive + bundled docs + deprecations)** — web_agents_breaking_changes_warning, web_agents_stale_training_data, web_agents_docs_first_rule, web_agents_bundled_nextjs_docs, web_agents_deprecation_notices [EXTRACTED 1.00]
- **Local Development Loop (dev server, app/page.tsx, App Router, font optimization)** — web_readme_development_server, web_readme_app_page_tsx, web_readme_app_router, web_readme_next_font [INFERRED 0.85]
- **Shared Site Navigation Across All Pages** — index_home_page, about_about_page, services_services_page, contact_contact_page, attorneys_attorneys_page, cases_cases_page, faq_faq_page, blog_blog_page [EXTRACTED 1.00]
- **Consultation CTA to Contact Conversion Funnel** — index_cta_consultation, services_services_page, attorneys_attorneys_page, cases_cases_page, contact_contact_form [INFERRED 0.75]
- **Practice Areas Linking Services, Detail, and Cases** — services_practice_areas, single_services_criminal_defense_detail, cases_case_studies, contact_contact_form [INFERRED 0.75]

## Communities (57 total, 6 thin omitted)

### Community 0 - "Route Metadata & Parsing"
Cohesion: 0.06
Nodes (58): crumbs, metadata, parsePage(), parseRating(), parseServiceSlug(), parseSort(), parseSource(), ReviewsPage() (+50 more)

### Community 1 - "Cases & Legal Pages"
Cohesion: 0.06
Nodes (39): CasesPage(), crumbs, metadata, crumbs, metadata, CaseCard(), ServiceCard(), TestimonialCard() (+31 more)

### Community 2 - "Booking DTOs & Results"
Cohesion: 0.11
Nodes (25): ActionError, BookingSummary, CreateBookingInput, RescheduleBookingInput, Result, BookingContext, CancelBookingDeps, CreateBookingDeps (+17 more)

### Community 3 - "Attorneys Page Routing"
Cohesion: 0.10
Nodes (22): AttorneysPage(), crumbs, metadata, SolicitorProfilePage(), SolicitorRepository, makeListSolicitors(), RelatedArticles(), TeamGrid() (+14 more)

### Community 4 - "Marketing Page Content"
Cohesion: 0.10
Nodes (32): 404 Page Not Found, About Us Page, Experienced Attorneys Team Grid, Mission, Vision & Values, Attorneys Page, Attorney Roster (8 profiles), Legal Insight Articles Grid, Blog / Articles Page (+24 more)

### Community 5 - "Legal Compliance Pages"
Cohesion: 0.11
Nodes (22): AccessibilityStatementPage(), crumbs, metadata, ComplaintsProcedurePage(), crumbs, metadata, CookiePolicyPage(), crumbs (+14 more)

### Community 6 - "Booking Repository Interface"
Cohesion: 0.14
Nodes (7): BookingRepository, Booking, BookingStatus, TimeSlot, getStore(), InMemoryBookingRepository, InMemoryBookingStore

### Community 7 - "Solicitor Repository & Catalog"
Cohesion: 0.12
Nodes (16): Solicitor, SolicitorRepository, CatalogDeps, listOfficesForSolicitor(), listServices(), listSolicitorsForService(), StaticSolicitorRepository, bookings (+8 more)

### Community 8 - "Booking Email Composer"
Cohesion: 0.23
Nodes (21): RFC-5545, adminEmail(), BookingEmailContext, composeAdminCancellationEmail(), composeAdminNewBookingEmail(), composeAdminRescheduleEmail(), composeCancellationEmail(), composeConfirmationEmail() (+13 more)

### Community 9 - "Footer, Manifest & Regulatory Info"
Cohesion: 0.23
Nodes (8): BADGES, TrustBadges(), legalConfig, footerLegalNav, footerNav, footerQuickLinks, siteConfig, LegalSection

### Community 10 - "About & FAQ Pages"
Cohesion: 0.12
Nodes (16): AboutPage(), crumbs, metadata, FaqPage(), homeFaqs, HomePage(), metadata, AboutBlock() (+8 more)

### Community 11 - "Project Dependencies"
Cohesion: 0.10
Nodes (20): dependencies, next, react, react-dom, zod, devDependencies, eslint, eslint-config-next (+12 more)

### Community 12 - "Root Layout & Cookie Consent"
Cohesion: 0.19
Nodes (15): metadata, RootLayout(), viewport, CookieConsentBanner(), CookiePreferencesDialog(), CookiePreferencesLink(), getServerSnapshot(), getSnapshot() (+7 more)

### Community 13 - "Sitemap & Blog Cards"
Cohesion: 0.18
Nodes (10): PostRepository, BlogCard(), formatDate(), authors, getAuthorBySlug(), getCategoryBySlug(), posts, serviceDetails (+2 more)

### Community 14 - "TypeScript Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 15 - "Blog Listing Page"
Cohesion: 0.16
Nodes (14): BlogPage(), crumbs, metadata, parseCategorySlug(), parsePage(), SearchParams, BlogList(), BlogToolbar() (+6 more)

### Community 16 - "Blog Ports & Article Hero"
Cohesion: 0.22
Nodes (9): AuthorRepository, CategoryRepository, ArticleHero(), formatDate(), categories, Author, Category, StaticAuthorRepository (+1 more)

### Community 17 - "Core Ports (Clock, Email)"
Cohesion: 0.16
Nodes (9): Clock, EmailAttachment, EmailMessage, NotificationService, ServiceRepository, sendDueReminders(), SendDueRemindersDeps, ConsoleNotificationService (+1 more)

### Community 18 - "Booking Server Actions"
Cohesion: 0.20
Nodes (13): cancelBookingAction(), clientIp(), createBookingAction(), getAvailabilityAction(), listOfficesForSolicitorAction(), listSolicitorsForServiceAction(), rescheduleBookingAction(), AsyncStatus (+5 more)

### Community 19 - "Blog Article Page"
Cohesion: 0.17
Nodes (9): ArticlePage(), ArticleBody(), AuthorBio(), ShareButtons(), TableOfContents(), ContentBlock, TocEntry, useActiveHeading() (+1 more)

### Community 20 - "Services Page"
Cohesion: 0.19
Nodes (12): crumbs, metadata, ServicesPage(), sameAs, serviceDurationMinutes, services, testimonialsServices, openingHours() (+4 more)

### Community 21 - "Next.js Breaking-Changes Warning"
Cohesion: 0.16
Nodes (17): Breaking Changes Warning ('This is NOT the Next.js you know'), Bundled Next.js Docs (node_modules/next/dist/docs/), Deprecation Notices, Docs-First Rule: Read the Guide Before Writing Code, Next.js (this project's version), Next.js Agent Rules Directive, Stale Training Data Risk, CLAUDE.md Import of AGENTS.md (@AGENTS.md) (+9 more)

### Community 22 - "Booking Wizard UI"
Cohesion: 0.18
Nodes (9): BookableService, BookingWizard(), StepIndicator(), OfficeStep(), ServiceStep(), SolicitorStep(), WIZARD_STEPS, WizardStepIndex (+1 more)

### Community 23 - "Blog Author DTOs"
Cohesion: 0.23
Nodes (12): AuthorProfile, ListPostsInput, ListPostsOutput, PostDetail, makeGetAuthorProfile(), makeListPosts(), BlogQuery, BlogQueryResult (+4 more)

### Community 24 - "Cron Route & Book Page"
Cohesion: 0.17
Nodes (9): BookPage(), crumbs, metadata, metadata, ICONS, StateBanner(), Variant, getSolicitorBySlug() (+1 more)

### Community 25 - "Solicitor Availability Scheduling"
Cohesion: 0.22
Nodes (11): scheduling, SolicitorData, standardWeek, generateAvailableSlots(), GenerateSlotsInput, makeSlot(), slotsOverlap(), getLocalYMD() (+3 more)

### Community 26 - "Office Repository"
Cohesion: 0.21
Nodes (6): Office, OfficeRepository, OfficeData, offices, solicitors, StaticOfficeRepository

### Community 27 - "Booking Result Helpers"
Cohesion: 0.35
Nodes (12): fail(), ok(), resolveBookingContext(), toBookingSummary(), cancelBooking(), createBooking(), getAvailability(), GetAvailabilityDeps (+4 more)

### Community 28 - "Spam Guard (Honeypot)"
Cohesion: 0.22
Nodes (7): SpamCheckInput, SpamCheckResult, SpamGuard, HoneypotSpamGuard, getBuckets(), InMemoryRateLimiter, Window

### Community 29 - "Google Places Reviews (proposed)"
Cohesion: 0.20
Nodes (12): Google Places API, GooglePlacesReviewRepository (proposed), listReviews use case, listVideoTestimonials use case, Review (domain entity), ReviewRepository interface, src/application/reviews/ports.ts, src/infrastructure/reviewsContainer.ts (+4 more)

### Community 30 - "Blog Author Profile Page"
Cohesion: 0.21
Nodes (7): AuthorProfilePage(), AuthorProfileHeader(), authorRepository, blogContainer, categoryRepository, postRepository, authorProfileSchema()

### Community 31 - "Marketing Layout & NavBar"
Cohesion: 0.20
Nodes (6): metadata, NavBar(), SiteFooter(), SiteHeader(), mainNav, NavItem

### Community 32 - "Booking Date/Time Steps"
Cohesion: 0.27
Nodes (8): RescheduleView(), DateTimeStep(), TimeSlotGrid(), TimezoneSelect(), COMMON_TIMEZONES, getTimeZoneOffsetMinutes(), zonedTimeToUtc(), groupSlotsByLocalDate()

### Community 33 - "Ports & Adapters Architecture"
Cohesion: 0.24
Nodes (11): ConsoleNotificationService, src/infrastructure/container.ts, src/application/booking/emailComposer.ts, NotificationService interface, Ports & Adapters Architecture Pattern, src/application/booking/ports.ts, Resend (email API service), ResendNotificationService (+3 more)

### Community 34 - "Blog Post Detail & Policy"
Cohesion: 0.36
Nodes (7): makeGetPostDetail(), BlogPolicy, computeReadingTime(), countWords(), wordCount(), selectRelatedPosts(), extractTableOfContents()

### Community 35 - "Booking Management & Calendar Export"
Cohesion: 0.29
Nodes (9): downloadIcs(), ManageBookingView(), summaryRows(), ReviewStep(), buildGoogleCalendarLink(), buildOutlookCalendarLink(), toCompactUtc(), formatInTimeZone() (+1 more)

### Community 36 - "Service Detail Page"
Cohesion: 0.27
Nodes (7): generateMetadata(), ServiceDetailPage(), buildMetadata(), BuildMetadataArgs, defaultOgImage, OgImage, serviceSchema()

### Community 37 - "Domain Entities & Seed Data"
Cohesion: 0.22
Nodes (9): src/data/*.ts seed files, Office (domain entity), OfficeRepository interface, Service (domain entity), ServiceRepository interface, SolicitorOffice (domain entity), SolicitorService (domain entity), StaticOfficeRepository (+1 more)

### Community 38 - "Contact Page"
Cohesion: 0.31
Nodes (6): ContactPage(), crumbs, metadata, ContactCards(), ContactForm(), contactPage()

### Community 39 - "Booking Reminder Cron Job"
Cohesion: 0.25
Nodes (8): BookingRepository interface, CRON_SECRET env var, InMemoryBookingRepository, src/app/api/cron/reminders/route.ts, prisma/schema.prisma, sendDueReminders use case, Vercel Cron, /vercel.json

### Community 40 - "Button UI Component"
Cohesion: 0.29
Nodes (7): Button(), classesFor(), CommonProps, LinkButtonProps, NativeButtonProps, Props, Variant

### Community 41 - "Calendar Sync Integrations (proposed)"
Cohesion: 0.29
Nodes (7): CalendarSyncService (proposed port), cancelBooking use case, Google Calendar API, googleapis (library), Microsoft Graph API, @microsoft/microsoft-graph-client, rescheduleBooking use case

### Community 42 - "Booking Creation & Rate Limiting"
Cohesion: 0.33
Nodes (7): createBooking use case, createReview use case (proposed), HoneypotSpamGuard, InMemoryRateLimiter, SpamGuard port, Upstash, @upstash/ratelimit

### Community 44 - "Booking Validation Schemas"
Cohesion: 0.40
Nodes (4): createBookingSchema, rescheduleBookingSchema, DetailsStep(), ClientDetails

### Community 45 - "Slot Concurrency Safety"
Cohesion: 0.50
Nodes (5): createIfSlotFree method, btree_gist EXCLUDE constraint, PrismaBookingRepository, rescheduleIfSlotFree method, SERIALIZABLE transaction (alternative)

### Community 46 - "Calendar UI Component"
Cohesion: 0.60
Nodes (4): addMonths(), Calendar(), toKey(), WEEKDAY_LABELS

### Community 47 - "Timezone Detection Hook"
Cohesion: 0.70
Nodes (4): getServerSnapshot(), getSnapshot(), subscribe(), useDetectedTimeZone()

### Community 48 - "Font Configuration"
Cohesion: 0.50
Nodes (3): cinzel, cormorant, inter

## Ambiguous Edges - Review These
- `Breaking Changes Warning ('This is NOT the Next.js you know')` → `Next.js Documentation (nextjs.org/docs)`  [AMBIGUOUS]
  web/AGENTS.md · relation: conceptually_related_to

## Knowledge Gaps
- **173 isolated node(s):** `allsolicitors (project README)`, `Hero — Reliable Legal Experts`, `Mission, Vision & Values`, `Family Law (Practice Area)`, `Corporate Law (Practice Area)` (+168 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Breaking Changes Warning ('This is NOT the Next.js you know')` and `Next.js Documentation (nextjs.org/docs)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `siteConfig` connect `Footer, Manifest & Regulatory Info` to `Route Metadata & Parsing`, `Attorneys Page Routing`, `Service Detail Page`, `Contact Page`, `Booking Email Composer`, `About & FAQ Pages`, `Root Layout & Cookie Consent`, `Sitemap & Blog Cards`, `Blog Article Page`, `Services Page`, `Office Repository`, `Marketing Layout & NavBar`?**
  _High betweenness centrality (0.062) - this node is a cross-community bridge._
- **Why does `breadcrumbList()` connect `Legal Compliance Pages` to `Route Metadata & Parsing`, `Cases & Legal Pages`, `Attorneys Page Routing`, `Service Detail Page`, `Contact Page`, `About & FAQ Pages`, `Blog Listing Page`, `Blog Article Page`, `Services Page`, `Cron Route & Book Page`, `Blog Author Profile Page`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Why does `SiteHeader()` connect `Marketing Layout & NavBar` to `Route Metadata & Parsing`, `Cases & Legal Pages`, `Attorneys Page Routing`, `Service Detail Page`, `Legal Compliance Pages`, `Contact Page`, `About & FAQ Pages`, `Blog Listing Page`, `Blog Article Page`, `Services Page`, `Cron Route & Book Page`, `Blog Author Profile Page`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **What connects `allsolicitors (project README)`, `Hero — Reliable Legal Experts`, `Mission, Vision & Values` to the rest of the system?**
  _177 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Route Metadata & Parsing` be split into smaller, more focused modules?**
  _Cohesion score 0.05745658835546476 - nodes in this community are weakly interconnected._
- **Should `Cases & Legal Pages` be split into smaller, more focused modules?**
  _Cohesion score 0.05924978687127025 - nodes in this community are weakly interconnected._