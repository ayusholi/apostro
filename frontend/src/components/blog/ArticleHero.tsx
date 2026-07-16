import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import type { Crumb } from "@/components/sections/PageHead";
import type { Author, Category, Post } from "@/domain/blog/Post";

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Left-aligned, editorial header for long-form reading — deliberately not
 * PageHead's centred marketing-hero treatment, since an article's title and
 * byline read better as a straightforward masthead than a hero hooked into
 * a two-word gold-emphasis split.
 */
export function ArticleHero({
  post,
  author,
  category,
  readingTime,
  breadcrumbs,
}: {
  post: Post;
  author: Author;
  category: Category;
  readingTime: number;
  breadcrumbs: Crumb[];
}) {
  return (
    <section className="article-hero">
      <Container>
        <nav className="crumbs" aria-label="Breadcrumb">
          <ol>
            {breadcrumbs.map((crumb) => (
              <li key={crumb.label} {...(crumb.href ? {} : { "aria-current": "page" as const })}>
                {crumb.href ? <Link href={crumb.href}>{crumb.label}</Link> : crumb.label}
              </li>
            ))}
          </ol>
        </nav>

        <Link href={`/blog?category=${category.slug}`} className="article-hero__category">
          {category.name}
        </Link>
        <h1>{post.title}</h1>

        <div className="article-hero__byline">
          <Image src={author.image} alt="" width={40} height={40} />
          <div>
            <Link href={`/blog/author/${author.slug}`}>{author.name}</Link>
            <span>
              {formatDate(post.publishedAt)} · {readingTime} min read
            </span>
          </div>
        </div>
      </Container>

      <div className="article-hero__cover">
        <Image src={post.coverImage} alt="" fill sizes="100vw" priority />
      </div>
    </section>
  );
}
