# Graph Report - /home/honeybadger/Documents/alls-file  (2026-07-17)

## Corpus Check
- 342 files · ~356,600 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 872 nodes · 2411 edges · 49 communities (42 shown, 7 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 23 edges (avg confidence: 0.67)
- Token cost: 108,755 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Booking Server Actions|Booking Server Actions]]
- [[_COMMUNITY_Listing Page Query Parsers|Listing Page Query Parsers]]
- [[_COMMUNITY_Booking DTOs & Result Types|Booking DTOs & Result Types]]
- [[_COMMUNITY_Booking Repository Port|Booking Repository Port]]
- [[_COMMUNITY_Legal & Compliance Pages|Legal & Compliance Pages]]
- [[_COMMUNITY_Booking Reschedule & Validation|Booking Reschedule & Validation]]
- [[_COMMUNITY_Booking Domain Rationale|Booking Domain Rationale]]
- [[_COMMUNITY_Booking Management Page & ID Generation|Booking Management Page & ID Generation]]
- [[_COMMUNITY_About & FAQ Pages|About & FAQ Pages]]
- [[_COMMUNITY_Marketing Layout Shell|Marketing Layout Shell]]
- [[_COMMUNITY_Package Dependencies|Package Dependencies]]
- [[_COMMUNITY_Solicitor Profile Pages|Solicitor Profile Pages]]
- [[_COMMUNITY_Notification & Spam Guard Ports|Notification & Spam Guard Ports]]
- [[_COMMUNITY_Solicitor Profile Domain|Solicitor Profile Domain]]
- [[_COMMUNITY_TypeScript Config|TypeScript Config]]
- [[_COMMUNITY_Blog Article Page|Blog Article Page]]
- [[_COMMUNITY_Contact Page|Contact Page]]
- [[_COMMUNITY_Marketing Content Components|Marketing Content Components]]
- [[_COMMUNITY_Services Listing|Services Listing]]
- [[_COMMUNITY_Office & Solicitor Static Data|Office & Solicitor Static Data]]
- [[_COMMUNITY_Cases & FAQ Components|Cases & FAQ Components]]
- [[_COMMUNITY_Cookie Consent|Cookie Consent]]
- [[_COMMUNITY_Root Layout & Book Page|Root Layout & Book Page]]
- [[_COMMUNITY_Blog Listing Page|Blog Listing Page]]
- [[_COMMUNITY_Blog AuthorPost Domain|Blog Author/Post Domain]]
- [[_COMMUNITY_Cases Page & Nav|Cases Page & Nav]]
- [[_COMMUNITY_Blog Repository & List Components|Blog Repository & List Components]]
- [[_COMMUNITY_Reviews Domain (Google Places)|Reviews Domain (Google Places)]]
- [[_COMMUNITY_About StatsCounter Components|About Stats/Counter Components]]
- [[_COMMUNITY_Sitemap & Author Data|Sitemap & Author Data]]
- [[_COMMUNITY_Blog Post Policy & Reading Time|Blog Post Policy & Reading Time]]
- [[_COMMUNITY_Hero & Button UI Components|Hero & Button UI Components]]
- [[_COMMUNITY_Author Profile Page|Author Profile Page]]
- [[_COMMUNITY_Solicitor Repository (Static Adapter)|Solicitor Repository (Static Adapter)]]
- [[_COMMUNITY_Legacy Justica Template Pages|Legacy Justica Template Pages]]
- [[_COMMUNITY_Blog Category Repository|Blog Category Repository]]
- [[_COMMUNITY_Attorneys Page|Attorneys Page]]
- [[_COMMUNITY_Testimonials Components|Testimonials Components]]
- [[_COMMUNITY_Project Documentation Overview|Project Documentation Overview]]
- [[_COMMUNITY_Blog Table of Contents|Blog Table of Contents]]
- [[_COMMUNITY_Rate Limiter|Rate Limiter]]
- [[_COMMUNITY_ESLint Config|ESLint Config]]
- [[_COMMUNITY_Next.js Config|Next.js Config]]
- [[_COMMUNITY_Next.js Env Types|Next.js Env Types]]
- [[_COMMUNITY_Vercel Cron Config|Vercel Cron Config]]
- [[_COMMUNITY_Postgres Adapter Guide|Postgres Adapter Guide]]
- [[_COMMUNITY_Email Message Type|Email Message Type]]
- [[_COMMUNITY_Justica Blog Template Page|Justica Blog Template Page]]

## God Nodes (most connected - your core abstractions)
1. `Container()` - 37 edges
2. `breadcrumbList()` - 37 edges
3. `buildMetadata()` - 24 edges
4. `siteConfig` - 23 edges
5. `SiteHeader()` - 22 edges
6. `JsonLd()` - 21 edges
7. `Reveal()` - 18 edges
8. `DomainError` - 18 edges
9. `PageHead()` - 17 edges
10. `Booking` - 17 edges

## Surprising Connections (you probably didn't know these)
- `useCountUp()` --indirect_call--> `tick()`  [INFERRED]
  frontend/src/hooks/useCountUp.ts → template/assets/js/script.js
- `AboutPage()` --calls--> `breadcrumbList()`  [EXTRACTED]
  frontend/src/app/(marketing)/about/page.tsx → frontend/src/lib/seo/schema.ts
- `generateMetadata()` --calls--> `buildMetadata()`  [EXTRACTED]
  frontend/src/app/(marketing)/blog/author/[slug]/page.tsx → frontend/src/lib/seo/metadata.ts
- `RootLayout()` --calls--> `organizationGraph()`  [EXTRACTED]
  frontend/src/app/layout.tsx → frontend/src/lib/seo/schema.ts
- `allsolicitors Repo Overview` --references--> `Backend Service (Reserved, Not Implemented)`  [EXTRACTED]
  README.md → backend/README.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Ports & Adapters (Hexagonal) Architecture** — src_application_booking_ports_bookingrepository, src_application_booking_ports_notificationservice, src_application_reviews_ports_reviewrepository, src_application_reviews_ports_videotestimonialrepository, src_infrastructure_container_container, src_infrastructure_reviewscontainer_reviewscontainer [INFERRED 0.85]
- **Shared Template Site Navigation (identical header/footer across all pages)** — template_404_page, template_about_page, template_attorneys_page, template_blog_page, template_cases_page, template_contact_page, template_faq_page, template_index_page, template_services_page, template_single_services_page [EXTRACTED 1.00]
- **Shared 'Schedule a Confidential Consultation' CTA Block** — template_about_page, template_attorneys_page, template_cases_page, template_index_page, template_services_page, template_single_services_page [EXTRACTED 1.00]

## Communities (49 total, 7 thin omitted)

### Community 0 - "Booking Server Actions"
Cohesion: 0.05
Nodes (72): cancelBookingAction(), clientIp(), createBookingAction(), getAvailabilityAction(), listOfficesForSolicitorAction(), listSolicitorsForServiceAction(), rescheduleBookingAction(), adminEmail() (+64 more)

### Community 1 - "Listing Page Query Parsers"
Cohesion: 0.06
Nodes (55): crumbs, metadata, parsePage(), parseRating(), parseServiceSlug(), parseSort(), parseSource(), ReviewsPage() (+47 more)

### Community 2 - "Booking DTOs & Result Types"
Cohesion: 0.15
Nodes (23): ActionError, BookingSummary, CreateBookingInput, fail(), ok(), RescheduleBookingInput, Result, OfficeRepository (+15 more)

### Community 3 - "Booking Repository Port"
Cohesion: 0.11
Nodes (14): BookingRepository, GetAvailabilityDeps, GetAvailabilityInput, generateAvailableSlots(), GenerateSlotsInput, Booking, BookingStatus, makeSlot() (+6 more)

### Community 4 - "Legal & Compliance Pages"
Cohesion: 0.10
Nodes (25): AccessibilityStatementPage(), crumbs, metadata, ComplaintsProcedurePage(), crumbs, metadata, CookiePolicyPage(), crumbs (+17 more)

### Community 5 - "Booking Reschedule & Validation"
Cohesion: 0.10
Nodes (17): RescheduleBookingDeps, createBookingSchema, rescheduleBookingSchema, zodFieldErrors(), BookingAlreadyCancelledError, BookingNotFoundError, CancellationWindowPassedError, DomainError (+9 more)

### Community 6 - "Booking Domain Rationale"
Cohesion: 0.08
Nodes (31): cancelBooking (use case), createBooking (use case), createReview (future use case), Postgres EXCLUDE Constraint (btree_gist) Design, rescheduleBooking (use case), Resend (email delivery service), sendDueReminders (use case), Upstash + @upstash/ratelimit (Redis-backed limiter) (+23 more)

### Community 7 - "Booking Management Page & ID Generation"
Cohesion: 0.09
Nodes (18): metadata, IdGenerator, CatalogDeps, listOfficesForSolicitor(), listServices(), listSolicitorsForService(), sendDueReminders(), CryptoIdGenerator (+10 more)

### Community 8 - "About & FAQ Pages"
Cohesion: 0.11
Nodes (23): AboutPage(), crumbs, metadata, crumbs, FaqPage(), metadata, homeFaqs, HomePage() (+15 more)

### Community 9 - "Marketing Layout Shell"
Cohesion: 0.19
Nodes (9): SiteFooter(), BADGES, TrustBadges(), legalConfig, footerLegalNav, footerNav, footerQuickLinks, siteConfig (+1 more)

### Community 10 - "Package Dependencies"
Cohesion: 0.10
Nodes (20): dependencies, next, react, react-dom, zod, devDependencies, eslint, eslint-config-next (+12 more)

### Community 11 - "Solicitor Profile Pages"
Cohesion: 0.15
Nodes (15): generateMetadata(), SolicitorProfilePage(), generateMetadata(), generateMetadata(), ServiceDetailPage(), RelatedArticles(), PageHead(), ServiceDetail() (+7 more)

### Community 12 - "Notification & Spam Guard Ports"
Cohesion: 0.16
Nodes (10): Clock, EmailAttachment, EmailMessage, NotificationService, SpamCheckInput, SpamCheckResult, SpamGuard, ConsoleNotificationService (+2 more)

### Community 13 - "Solicitor Profile Domain"
Cohesion: 0.22
Nodes (10): SolicitorProfile, SolicitorRepository, makeGetSolicitorProfile(), makeListSolicitors(), solicitors, Solicitor, StaticSolicitorRepository, postRepository (+2 more)

### Community 14 - "TypeScript Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 15 - "Blog Article Page"
Cohesion: 0.15
Nodes (12): ArticlePage(), ArticleBody(), ArticleHero(), formatDate(), AuthorBio(), ShareButtons(), ContentBlock, authorRepository (+4 more)

### Community 16 - "Contact Page"
Cohesion: 0.23
Nodes (10): ContactPage(), crumbs, metadata, ContactCards(), ContactForm(), Eyebrow(), Reveal(), Tag (+2 more)

### Community 17 - "Marketing Content Components"
Cohesion: 0.23
Nodes (8): ServiceCard(), ServicesGrid(), SolicitorCard(), Container(), SectionHead(), clientLogos, stats, Service

### Community 18 - "Services Listing"
Cohesion: 0.20
Nodes (12): crumbs, metadata, ServicesPage(), sameAs, ServiceDetail, serviceDurationMinutes, services, openingHours() (+4 more)

### Community 19 - "Office & Solicitor Static Data"
Cohesion: 0.17
Nodes (10): Office, OfficeData, offices, scheduling, SolicitorData, solicitors, standardWeek, DayHours (+2 more)

### Community 20 - "Cases & FAQ Components"
Cohesion: 0.20
Nodes (8): CaseCard(), CasesGrid(), FaqAccordion(), cases, CaseStudy, Faq, LegalSection, Stat

### Community 21 - "Cookie Consent"
Cohesion: 0.25
Nodes (12): CookieConsentBanner(), CookiePreferencesDialog(), CookiePreferencesLink(), getServerSnapshot(), getSnapshot(), subscribe(), useCookieConsent(), ACCEPT_ALL (+4 more)

### Community 22 - "Root Layout & Book Page"
Cohesion: 0.15
Nodes (12): metadata, RootLayout(), viewport, BookPage(), crumbs, metadata, BookingWizard(), JsonLd() (+4 more)

### Community 23 - "Blog Listing Page"
Cohesion: 0.20
Nodes (12): BlogPage(), crumbs, metadata, parseCategorySlug(), parsePage(), SearchParams, BlogToolbar(), hrefFor() (+4 more)

### Community 24 - "Blog Author/Post Domain"
Cohesion: 0.23
Nodes (12): AuthorProfile, ListPostsInput, ListPostsOutput, PostDetail, makeGetAuthorProfile(), makeListPosts(), BlogQuery, BlogQueryResult (+4 more)

### Community 25 - "Cases Page & Nav"
Cohesion: 0.19
Nodes (9): CasesPage(), crumbs, metadata, metadata, NavBar(), SiteHeader(), mainNav, useDisclosure() (+1 more)

### Community 26 - "Blog Repository & List Components"
Cohesion: 0.27
Nodes (8): PostRepository, BlogCard(), formatDate(), getAuthorBySlug(), getCategoryBySlug(), posts, Post, StaticPostRepository

### Community 27 - "Reviews Domain (Google Places)"
Cohesion: 0.20
Nodes (12): Google Places API (place/details endpoint), GooglePlacesReviewRepository (hypothetical future adapter), listReviews (use case), listVideoTestimonials (use case), ReviewRepository (port), VideoTestimonialRepository (port), src/components/reviews/* (components), src/data/reviews.ts (seed data) (+4 more)

### Community 28 - "About Stats/Counter Components"
Cohesion: 0.29
Nodes (7): CountUp(), useCountUp(), getServerSnapshot(), getSnapshot(), subscribe(), usePrefersReducedMotion(), tick()

### Community 29 - "Sitemap & Author Data"
Cohesion: 0.29
Nodes (5): AuthorRepository, authors, serviceDetails, Author, StaticAuthorRepository

### Community 30 - "Blog Post Policy & Reading Time"
Cohesion: 0.36
Nodes (7): makeGetPostDetail(), BlogPolicy, computeReadingTime(), countWords(), wordCount(), selectRelatedPosts(), extractTableOfContents()

### Community 31 - "Hero & Button UI Components"
Cohesion: 0.24
Nodes (8): SolicitorProfileHero(), Button(), classesFor(), CommonProps, LinkButtonProps, NativeButtonProps, Props, Variant

### Community 32 - "Author Profile Page"
Cohesion: 0.27
Nodes (6): AuthorProfilePage(), generateMetadata(), AuthorProfileHeader(), BlogList(), Crumb, authorProfileSchema()

### Community 33 - "Solicitor Repository (Static Adapter)"
Cohesion: 0.31
Nodes (3): Solicitor, SolicitorRepository, StaticSolicitorRepository

### Community 34 - "Legacy Justica Template Pages"
Cohesion: 0.27
Nodes (10): 404 Page Not Found (Justica template), About Us Page (Justica template), Attorneys Page (Justica template), Cases Page (Justica template), Contact Page (Justica template), FAQ Page (Justica template), Brand Mismatch: ALLS vs Justica, Home Page (ALLS-rebranded template) (+2 more)

### Community 35 - "Blog Category Repository"
Cohesion: 0.42
Nodes (4): CategoryRepository, categories, Category, StaticCategoryRepository

### Community 36 - "Attorneys Page"
Cohesion: 0.33
Nodes (6): AttorneysPage(), crumbs, metadata, CtaBanner(), TeamGrid(), solicitorList()

### Community 37 - "Testimonials Components"
Cohesion: 0.38
Nodes (4): TestimonialCard(), TestimonialsSection(), testimonialsServices, Testimonial

### Community 38 - "Project Documentation Overview"
Cohesion: 0.40
Nodes (6): Backend Service (Reserved, Not Implemented), Next.js Agent Rules Notice, Frontend CLAUDE.md Config, Frontend Next.js App (create-next-app boilerplate), allsolicitors Repo Overview, Template Folder Overview

### Community 39 - "Blog Table of Contents"
Cohesion: 0.53
Nodes (3): TableOfContents(), TocEntry, useActiveHeading()

### Community 40 - "Rate Limiter"
Cohesion: 0.40
Nodes (3): getBuckets(), InMemoryRateLimiter, Window

## Knowledge Gaps
- **164 isolated node(s):** `eslintConfig`, `nextConfig`, `name`, `version`, `private` (+159 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `siteConfig` connect `Marketing Layout Shell` to `Booking Server Actions`, `Listing Page Query Parsers`, `Legal & Compliance Pages`, `Solicitor Profile Pages`, `Blog Article Page`, `Contact Page`, `Services Listing`, `Office & Solicitor Static Data`, `Cases & FAQ Components`, `Root Layout & Book Page`, `Cases Page & Nav`, `Sitemap & Author Data`?**
  _High betweenness centrality (0.066) - this node is a cross-community bridge._
- **Why does `Container()` connect `Marketing Content Components` to `Author Profile Page`, `Listing Page Query Parsers`, `Legal & Compliance Pages`, `Testimonials Components`, `Booking Management Page & ID Generation`, `Marketing Layout Shell`, `Solicitor Profile Pages`, `Blog Article Page`, `Contact Page`, `Cases & FAQ Components`, `Root Layout & Book Page`, `Blog Listing Page`, `Cases Page & Nav`, `About Stats/Counter Components`, `Hero & Button UI Components`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Why does `breadcrumbList()` connect `Legal & Compliance Pages` to `Author Profile Page`, `Listing Page Query Parsers`, `Attorneys Page`, `About & FAQ Pages`, `Solicitor Profile Pages`, `Blog Article Page`, `Contact Page`, `Services Listing`, `Root Layout & Book Page`, `Blog Listing Page`, `Cases Page & Nav`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `NOTE: This file should not be edited`, `nextConfig` to the rest of the system?**
  _166 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Booking Server Actions` be split into smaller, more focused modules?**
  _Cohesion score 0.05197368421052632 - nodes in this community are weakly interconnected._
- **Should `Listing Page Query Parsers` be split into smaller, more focused modules?**
  _Cohesion score 0.05938375350140056 - nodes in this community are weakly interconnected._
- **Should `Booking Repository Port` be split into smaller, more focused modules?**
  _Cohesion score 0.1092436974789916 - nodes in this community are weakly interconnected._