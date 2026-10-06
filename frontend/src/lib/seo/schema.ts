import { siteConfig, sameAs } from "@/config/site";
import { services, serviceDetails, getServiceBySlug } from "@/data/services";
import type { CaseStudy, Faq, Service } from "@/types";
import type { Review } from "@/domain/reviews/Review";
import type { RatingStats } from "@/domain/reviews/stats";
import type { Author, Category, Post } from "@/domain/blog/Post";
import type { Solicitor } from "@/domain/team/Solicitor";

/**
 * JSON-LD builders. Every function returns a plain object ready to be
 * JSON.stringify'd into a <script type="application/ld+json">.
 *
 * Design notes:
 * - One canonical entity per @id, cross-referenced by @id, instead of
 *   re-describing the firm on every page. Google resolves the references.
 * - The firm is modelled as a WebSite + Organization + LegalService graph.
 *   LegalService is a subtype of LocalBusiness, which is a subtype of
 *   Organization, so this single well-typed graph satisfies the Organization,
 *   LocalBusiness, and LegalService requirements at once — the correct model,
 *   rather than three overlapping nodes that can confuse parsers.
 */

const BASE = siteConfig.url;
export const ORG_ID = `${BASE}/#organization`;
export const LEGAL_ID = `${BASE}/#legalservice`;
export const WEBSITE_ID = `${BASE}/#website`;

/** Resolve a site-relative path to an absolute URL. */
export function abs(path: string): string {
  return path.startsWith("http") ? path : `${BASE}${path}`;
}

function postalAddress() {
  const a = siteConfig.postalAddress;
  return {
    "@type": "PostalAddress",
    streetAddress: a.streetAddress,
    addressLocality: a.addressLocality,
    addressRegion: a.addressRegion,
    addressCountry: a.addressCountry,
    ...(a.postalCode ? { postalCode: a.postalCode } : {}),
  };
}

function openingHours() {
  return [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "18:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Saturday"],
      opens: "10:00",
      closes: "14:00",
    },
  ];
}

function serviceUrl(slug: string): string {
  // Only slugs with a real detail page get their own URL; the rest resolve to
  // the services index so we never advertise a URL that would 404.
  return serviceDetails[slug] ? abs(`/services/${slug}`) : abs("/services");
}

/** Sitewide entity graph — rendered once in the root layout. */
export function organizationGraph() {
  const organization = {
    "@type": "Organization",
    "@id": ORG_ID,
    name: siteConfig.name,
    legalName: siteConfig.legalName,
    url: BASE,
    logo: {
      "@type": "ImageObject",
      url: abs("/brand/logo.png"),
      width: 1024,
      height: 1024,
    },
    image: abs(siteConfig.ogImage),
    description: siteConfig.description,
    email: siteConfig.email,
    telephone: siteConfig.phoneE164,
    address: postalAddress(),
    foundingDate: String(siteConfig.foundingYear),
    numberOfEmployees: {
      "@type": "QuantitativeValue",
      minValue: siteConfig.employeeCountMin,
    },
    areaServed: { "@type": "Country", name: siteConfig.areaServed },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: siteConfig.phoneE164,
      email: siteConfig.email,
      contactType: "customer service",
      areaServed: "GB",
      availableLanguage: ["English"],
    },
    ...(sameAs.length ? { sameAs } : {}),
  };

  const website = {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: BASE,
    name: siteConfig.name,
    description: siteConfig.description,
    inLanguage: siteConfig.htmlLang,
    publisher: { "@id": ORG_ID },
  };

  const legalService = {
    "@type": "LegalService",
    "@id": LEGAL_ID,
    name: siteConfig.name,
    url: BASE,
    image: abs(siteConfig.ogImage),
    logo: abs("/brand/logo.png"),
    description: siteConfig.description,
    telephone: siteConfig.phoneE164,
    email: siteConfig.email,
    priceRange: siteConfig.priceRange,
    currenciesAccepted: "GBP",
    address: postalAddress(),
    geo: {
      "@type": "GeoCoordinates",
      latitude: siteConfig.geo.latitude,
      longitude: siteConfig.geo.longitude,
    },
    areaServed: { "@type": "Country", name: siteConfig.areaServed },
    openingHoursSpecification: openingHours(),
    parentOrganization: { "@id": ORG_ID },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Legal Services",
      itemListElement: services.map((s) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: s.title,
          serviceType: s.title,
          url: serviceUrl(s.slug),
          provider: { "@id": ORG_ID },
        },
      })),
    },
  };

  return { "@context": "https://schema.org", "@graph": [website, organization, legalService] };
}

/** BreadcrumbList — pass the full trail; the last item is the current page (no `path`). */
export function breadcrumbList(items: { name: string; path?: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      ...(item.path ? { item: abs(item.path) } : {}),
    })),
  };
}

/** FAQPage — mirrors the visible accordion Q&A. */
export function faqPage(faqs: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

/** Directory of individual solicitors as Person entities linking to their profiles. */
export function solicitorList(solicitors: Solicitor[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${siteConfig.name} Solicitors`,
    itemListElement: solicitors.map((solicitor, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Person",
        name: solicitor.name,
        jobTitle: solicitor.role,
        image: abs(solicitor.image),
        worksFor: { "@id": ORG_ID },
        url: abs(`/solicitors/${solicitor.slug}`),
      },
    })),
  };
}

/** Full solicitor profile page → a detailed Person node (credentials, languages, practice areas). */
export function solicitorProfileSchema(solicitor: Solicitor) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${abs(`/solicitors/${solicitor.slug}`)}#profilepage`,
    url: abs(`/solicitors/${solicitor.slug}`),
    name: solicitor.name,
    mainEntity: {
      "@type": "Person",
      name: solicitor.name,
      jobTitle: solicitor.role,
      image: abs(solicitor.image),
      description: solicitor.bio,
      email: solicitor.email,
      ...(solicitor.phone ? { telephone: solicitor.phone } : {}),
      worksFor: { "@id": ORG_ID },
      knowsLanguage: solicitor.languages,
      hasCredential: solicitor.qualifications.map((qualification) => ({
        "@type": "EducationalOccupationalCredential",
        name: qualification,
      })),
      memberOf: solicitor.memberships.map((membership) => ({
        "@type": "Organization",
        name: membership,
      })),
      knowsAbout: solicitor.practiceAreaSlugs
        .map((slug) => getServiceBySlug(slug)?.title)
        .filter((title): title is string => Boolean(title)),
    },
  };
}

/** Single Service (detail page). */
export function serviceSchema(args: { name: string; description: string; path: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: args.name,
    serviceType: args.name,
    description: args.description,
    url: abs(args.path),
    provider: { "@id": ORG_ID },
    areaServed: { "@type": "Country", name: siteConfig.areaServed },
  };
}

/** Services index as an ItemList of Service offerings. */
export function serviceItemList(list: Service[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Our Legal Services",
    itemListElement: list.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Service",
        name: s.title,
        serviceType: s.title,
        url: serviceUrl(s.slug),
        provider: { "@id": ORG_ID },
      },
    })),
  };
}

/** Blog listing → Blog with BlogPosting (Article subtype) entries, one per visible post. */
export function blogSchema(posts: Post[], authors: Author[], categories: Category[]) {
  const authorName = (slug: string) => authors.find((a) => a.slug === slug)?.name ?? siteConfig.name;
  const categoryName = (slug: string) => categories.find((c) => c.slug === slug)?.name;

  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${abs("/blog")}#blog`,
    name: `${siteConfig.name} Blog`,
    url: abs("/blog"),
    description: "Legal guides and insights from the team at ALLS.",
    inLanguage: siteConfig.htmlLang,
    publisher: { "@id": ORG_ID },
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      url: abs(`/blog/${post.slug}`),
      image: abs(post.coverImage),
      datePublished: post.publishedAt,
      ...(post.updatedAt ? { dateModified: post.updatedAt } : {}),
      ...(categoryName(post.categorySlug) ? { articleSection: categoryName(post.categorySlug) } : {}),
      author: { "@type": "Person", name: authorName(post.authorSlug) },
      publisher: { "@id": ORG_ID },
      mainEntityOfPage: abs(`/blog/${post.slug}`),
    })),
  };
}

/** Single article page → full BlogPosting, linked back to the firm via publisher and to the author via a real Person node. */
export function articleSchema(post: Post, author: Author, category: Category) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${abs(`/blog/${post.slug}`)}#article`,
    headline: post.title,
    description: post.excerpt,
    image: abs(post.coverImage),
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    articleSection: category.name,
    keywords: post.tags.join(", "),
    inLanguage: siteConfig.htmlLang,
    author: {
      "@type": "Person",
      name: author.name,
      url: abs(`/blog/author/${author.slug}`),
      jobTitle: author.role,
      worksFor: { "@id": ORG_ID },
    },
    publisher: { "@id": ORG_ID },
    mainEntityOfPage: abs(`/blog/${post.slug}`),
  };
}

/** Author profile page → ProfilePage wrapping a Person, so the author is a real linkable entity, not just inline text. */
export function authorProfileSchema(author: Author) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${abs(`/blog/author/${author.slug}`)}#profilepage`,
    url: abs(`/blog/author/${author.slug}`),
    name: author.name,
    mainEntity: {
      "@type": "Person",
      name: author.name,
      jobTitle: author.role,
      image: abs(author.image),
      description: author.bio,
      worksFor: { "@id": ORG_ID },
    },
  };
}

/** Case studies index as an ItemList of CreativeWork entries. */
export function caseItemList(cases: CaseStudy[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Recent Cases",
    itemListElement: cases.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "CreativeWork",
        name: c.title,
        about: c.tag,
        image: abs(c.image),
        creator: { "@id": ORG_ID },
      },
    })),
  };
}

/** One schema.org Review node, linked back to the firm via itemReviewed. */
function reviewNode(review: Review) {
  return {
    "@type": "Review",
    author: { "@type": "Person", name: review.authorName },
    datePublished: review.date,
    reviewRating: {
      "@type": "Rating",
      ratingValue: review.rating,
      bestRating: 5,
      worstRating: 1,
    },
    ...(review.title ? { name: review.title } : {}),
    reviewBody: review.body,
    itemReviewed: { "@id": LEGAL_ID },
  };
}

/**
 * Reviews page markup: attaches an AggregateRating and the currently visible
 * page of Review nodes to the SAME LegalService @id described sitewide in
 * organizationGraph(). Only the reviews actually rendered on the page are
 * included — structured data should mirror visible content, not the full
 * (paginated-away) dataset — while aggregateRating reflects every review,
 * matching the "Based on N reviews" figure shown in OverallRatingSummary.
 */
export function reviewsPageSchema(visibleReviews: Review[], stats: RatingStats) {
  return {
    "@context": "https://schema.org",
    "@type": "LegalService",
    "@id": LEGAL_ID,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: stats.average,
      reviewCount: stats.count,
      bestRating: 5,
      worstRating: 1,
    },
    review: visibleReviews.map(reviewNode),
  };
}

/** ContactPage. */
export function contactPage() {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "@id": `${abs("/contact")}#contactpage`,
    url: abs("/contact"),
    name: `Contact ${siteConfig.name}`,
    description: siteConfig.description,
    inLanguage: siteConfig.htmlLang,
    about: { "@id": ORG_ID },
    primaryImageOfPage: abs(siteConfig.ogImage),
  };
}
