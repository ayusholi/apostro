import Image from "next/image";
import Link from "next/link";
import type { Author } from "@/domain/blog/Post";

/** Compact byline card shown at the end of an article, linking through to the full author profile page. */
export function AuthorBio({ author }: { author: Author }) {
  return (
    <div className="author-bio">
      <Image src={author.image} alt="" width={64} height={64} />
      <div>
        <span className="author-bio__label">Written by</span>
        <h3>
          <Link href={`/blog/author/${author.slug}`}>{author.name}</Link>
        </h3>
        <p className="author-bio__role">{author.role}</p>
        <p>{author.bio}</p>
      </div>
    </div>
  );
}
