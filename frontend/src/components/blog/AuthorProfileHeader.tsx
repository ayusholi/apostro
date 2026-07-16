import Image from "next/image";
import { Container } from "@/components/ui/Container";
import type { Crumb } from "@/components/sections/PageHead";
import type { Author } from "@/domain/blog/Post";
import Link from "next/link";

export function AuthorProfileHeader({ author, breadcrumbs }: { author: Author; breadcrumbs: Crumb[] }) {
  return (
    <section className="article-hero author-profile-hero">
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

        <div className="author-profile-hero__row">
          <Image src={author.image} alt="" width={96} height={96} />
          <div>
            <h1>{author.name}</h1>
            <p className="author-bio__role">{author.role}</p>
            <p>{author.bio}</p>
          </div>
        </div>
      </Container>
    </section>
  );
}
