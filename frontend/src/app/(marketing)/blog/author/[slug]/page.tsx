import "@/styles/blog.css";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Container } from "@/components/ui/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { AuthorProfileHeader } from "@/components/blog/AuthorProfileHeader";
import { BlogList } from "@/components/blog/BlogList";
import { blogContainer } from "@/infrastructure/blogContainer";
import { breadcrumbList, authorProfileSchema } from "@/lib/seo/schema";
import { buildMetadata } from "@/lib/seo/metadata";

export async function generateStaticParams() {
  const authors = await blogContainer.listAllAuthors();
  return authors.map((author) => ({ slug: author.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const profile = await blogContainer.getAuthorProfile(slug);
  if (!profile) return {};

  return buildMetadata({
    title: profile.author.name,
    description: profile.author.bio,
    path: `/blog/author/${slug}`,
  });
}

export default async function AuthorProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const profile = await blogContainer.getAuthorProfile(slug);
  if (!profile) notFound();

  const { author, posts } = profile;
  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog" },
    { label: author.name },
  ];

  return (
    <>
      <JsonLd
        data={[
          breadcrumbList([{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }, { name: author.name }]),
          authorProfileSchema(author),
        ]}
      />
      <SiteHeader />
      <main id="main">
        <AuthorProfileHeader author={author} breadcrumbs={crumbs} />
        <section className="section">
          <Container>
            <h2 className="author-profile-heading">Articles by {author.name}</h2>
            <BlogList posts={posts} />
          </Container>
        </section>
      </main>
    </>
  );
}
