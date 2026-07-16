/**
 * Structured content blocks instead of a single HTML/markdown string.
 * Two reasons: (1) it's rendered directly to JSX with no
 * dangerouslySetInnerHTML anywhere, so a CMS-sourced article can never
 * inject a script tag; (2) reading time and the table of contents are pure
 * functions over this shape (@see readingTime.ts, tableOfContents.ts) rather
 * than an HTML/markdown parser. This is also closer to what real headless
 * CMSs (Sanity's Portable Text, Contentful's rich text) actually return than
 * a flat HTML string would be, which is exactly the shape a future
 * PostRepository swap needs to map into.
 */
export type ContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; level: 2 | 3; id: string; text: string }
  | { type: "list"; items: string[] }
  | { type: "quote"; text: string; attribution?: string };

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  categorySlug: string;
  /** Free-form tag slugs — @see tagLabel.ts for slug → display label. */
  tags: string[];
  authorSlug: string;
  /** ISO 8601 date. */
  publishedAt: string;
  /** ISO 8601 date — only set once an already-published article is edited. */
  updatedAt?: string;
  body: ContentBlock[];
};

export type Category = {
  slug: string;
  name: string;
  description: string;
};

export type Author = {
  slug: string;
  name: string;
  role: string;
  image: string;
  bio: string;
};
