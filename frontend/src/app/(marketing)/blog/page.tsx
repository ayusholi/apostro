import "@/styles/blog.css";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { PageHead } from "@/components/sections/PageHead";
import { LogoStrip } from "@/components/sections/LogoStrip";
import { Container } from "@/components/ui/Container";
import { Pagination } from "@/components/ui/Pagination";
import { JsonLd } from "@/components/seo/JsonLd";
import { BlogToolbar } from "@/components/blog/BlogToolbar";
import { BlogList } from "@/components/blog/BlogList";
import { blogContainer } from "@/infrastructure/blogContainer";
import { breadcrumbList, blogSchema } from "@/lib/seo/schema";
import { buildMetadata } from "@/lib/seo/metadata";
import { authors } from "@/data/blog/authors";
import { categories } from "@/data/blog/categories";
import type { BlogFilter } from "@/domain/blog/query";

export const metadata = buildMetadata({
  title: "Blog",
  description: "Legal guides and insights from the team at ALLS — criminal defence, family law, corporate, and property.",
  path: "/blog",
});

const crumbs = [{ label: "Home", href: "/" }, { label: "Blog" }];

function parseCategorySlug(raw?: string): string | undefined {
  return raw && categories.some((c) => c.slug === raw) ? raw : undefined;
}

function parsePage(raw?: string): number {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : 1;
}

type SearchParams = { q?: string; category?: string; tag?: string; page?: string };

export default async function BlogPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  // No published articles right now — send visitors home rather than showing an empty listing.
  const allPosts = await blogContainer.listAllPosts();
  if (allPosts.length === 0) redirect("/");

  const rawParams = await searchParams;

  const filter: BlogFilter = {
    query: rawParams.q?.trim() || undefined,
    categorySlug: parseCategorySlug(rawParams.category),
    tag: rawParams.tag?.trim() || undefined,
  };
  const page = parsePage(rawParams.page);

  const { posts, page: currentPage, pageCount, totalMatching, categories: categoryCounts, tags } =
    await blogContainer.listPosts({ filter, page });

  // Query string for pagination links, without `page` — Pagination.tsx owns that param.
  const linkParams = new URLSearchParams();
  if (filter.query) linkParams.set("q", filter.query);
  if (filter.categorySlug) linkParams.set("category", filter.categorySlug);
  if (filter.tag) linkParams.set("tag", filter.tag);

  return (
    <>
      <JsonLd
        data={[
          breadcrumbList([{ name: "Home", path: "/" }, { name: "Blog" }]),
          blogSchema(posts, authors, categories),
        ]}
      />
      <SiteHeader />
      <main id="main">
        <PageHead
          breadcrumbs={crumbs}
          title="Latest"
          emphasis="Articles"
          description="Legal guides and insights from the team at ALLS."
        />
        <LogoStrip />
        <section className="section">
          <Container>
            <BlogToolbar filter={filter} categories={categoryCounts} tags={tags} />
            <p className="blog-results-count">
              Showing {posts.length} of {totalMatching} article{totalMatching === 1 ? "" : "s"}.
            </p>
            <BlogList posts={posts} />
            <Pagination page={currentPage} pageCount={pageCount} basePath="/blog" searchParams={linkParams} ariaLabel="Blog pagination" />
          </Container>
        </section>
      </main>
    </>
  );
}
