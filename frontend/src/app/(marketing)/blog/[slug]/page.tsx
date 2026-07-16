import "@/styles/blog.css";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Container } from "@/components/ui/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { ArticleHero } from "@/components/blog/ArticleHero";
import { ArticleBody } from "@/components/blog/ArticleBody";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { ShareButtons } from "@/components/blog/ShareButtons";
import { AuthorBio } from "@/components/blog/AuthorBio";
import { RelatedArticles } from "@/components/blog/RelatedArticles";
import { blogContainer } from "@/infrastructure/blogContainer";
import { breadcrumbList, articleSchema } from "@/lib/seo/schema";
import { buildMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/config/site";

export async function generateStaticParams() {
  const posts = await blogContainer.listAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const detail = await blogContainer.getPostDetail(slug);
  if (!detail) return {};

  return buildMetadata({
    title: detail.post.title,
    description: detail.post.excerpt,
    path: `/blog/${slug}`,
    type: "article",
    publishedTime: detail.post.publishedAt,
    images: [{ url: detail.post.coverImage, width: 1200, height: 630, alt: detail.post.title }],
  });
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const detail = await blogContainer.getPostDetail(slug);
  if (!detail) notFound();

  const { post, author, category, readingTime, toc, related } = detail;

  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog" },
    { label: post.title },
  ];

  return (
    <>
      <JsonLd
        data={[
          breadcrumbList([{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }, { name: post.title }]),
          articleSchema(post, author, category),
        ]}
      />
      <SiteHeader />
      <main id="main">
        <ArticleHero post={post} author={author} category={category} readingTime={readingTime} breadcrumbs={crumbs} />

        <section className="section">
          <Container>
            <div className="article-layout">
              <div className="article-layout__main">
                <ArticleBody body={post.body} />

                <div className="article-tags">
                  {post.tags.map((tag) => (
                    <a key={tag} href={`/blog?tag=${tag}`}>
                      #{tag}
                    </a>
                  ))}
                </div>

                <ShareButtons url={`${siteConfig.url}/blog/${post.slug}`} title={post.title} />
                <AuthorBio author={author} />
              </div>

              <aside className="article-layout__sidebar">
                <TableOfContents entries={toc} />
              </aside>
            </div>
          </Container>
        </section>

        <RelatedArticles posts={related} />
        <CtaBanner />
      </main>
    </>
  );
}
