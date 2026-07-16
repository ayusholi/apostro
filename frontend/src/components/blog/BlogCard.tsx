import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { computeReadingTime } from "@/domain/blog/readingTime";
import { getCategoryBySlug } from "@/data/blog/categories";
import { getAuthorBySlug } from "@/data/blog/authors";
import type { Post } from "@/domain/blog/Post";

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function BlogCard({ post }: { post: Post }) {
  const category = getCategoryBySlug(post.categorySlug);
  const author = getAuthorBySlug(post.authorSlug);
  const readingTime = computeReadingTime(post.body);

  return (
    <Reveal as="article" className="post">
      <Link className="post__img" href={`/blog/${post.slug}`} aria-label={post.title}>
        <Image src={post.coverImage} alt={post.title} fill sizes="(max-width: 768px) 100vw, 33vw" />
      </Link>
      <div className="post__body">
        <span className="post__meta">
          {category?.name ?? post.categorySlug} · {formatDate(post.publishedAt)} · {readingTime} min read
        </span>
        <h3>
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h3>
        <p>{post.excerpt}</p>
        {author && (
          <div className="post__author">
            <Image src={author.image} alt="" width={28} height={28} />
            <span>{author.name}</span>
          </div>
        )}
        <Link className="read" href={`/blog/${post.slug}`} aria-label={`Read more: ${post.title}`}>
          Read More →
        </Link>
      </div>
    </Reveal>
  );
}
