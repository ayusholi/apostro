import { Container } from "@/components/ui/Container";
import { SectionHead } from "@/components/ui/SectionHead";
import { BlogCard } from "@/components/blog/BlogCard";
import type { Post } from "@/domain/blog/Post";

export function RelatedArticles({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="section section--tight">
      <Container>
        <SectionHead eyebrow="Related" title="Related Articles" />
        <div className="blog-grid">
          {posts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      </Container>
    </section>
  );
}
