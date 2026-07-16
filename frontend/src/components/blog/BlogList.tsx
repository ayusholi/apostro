import { StateBanner } from "@/components/ui/StateBanner";
import { BlogCard } from "@/components/blog/BlogCard";
import type { Post } from "@/domain/blog/Post";

export function BlogList({ posts }: { posts: Post[] }) {
  if (posts.length === 0) {
    return (
      <StateBanner variant="empty" title="No articles match these filters">
        Try a different search term, or clear a filter.
      </StateBanner>
    );
  }

  return (
    <div className="blog-grid">
      {posts.map((post) => (
        <BlogCard key={post.slug} post={post} />
      ))}
    </div>
  );
}
