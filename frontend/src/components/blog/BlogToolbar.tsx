import Link from "next/link";
import { AutoSubmitSelect } from "@/components/ui/AutoSubmitSelect";
import { tagLabel } from "@/domain/blog/tagLabel";
import type { BlogFilter } from "@/domain/blog/query";
import type { Category } from "@/domain/blog/Post";

/**
 * A native GET <form> — same reasoning as ReviewsToolbar: searching/filtering
 * is just navigating to /blog?q=...&category=...&tag=..., so it's crawlable,
 * bookmarkable, and works with JavaScript disabled via the submit button.
 */
export function BlogToolbar({
  filter,
  categories,
  tags,
}: {
  filter: BlogFilter;
  categories: { category: Category; count: number }[];
  tags: string[];
}) {
  const hasActiveFilter = Boolean(filter.categorySlug || filter.tag || filter.query?.trim());

  return (
    <form className="blog-toolbar" method="get" action="/blog" role="search" aria-label="Search and filter articles">
      <div className="field blog-toolbar__search">
        <label htmlFor="bt-q">Search articles</label>
        <input id="bt-q" type="search" name="q" defaultValue={filter.query ?? ""} placeholder="Search by keyword…" />
      </div>

      <div className="field blog-toolbar__field">
        <label htmlFor="bt-category">Category</label>
        <AutoSubmitSelect id="bt-category" name="category" defaultValue={filter.categorySlug ?? ""}>
          <option value="">All categories</option>
          {categories.map(({ category, count }) => (
            <option key={category.slug} value={category.slug}>
              {category.name} ({count})
            </option>
          ))}
        </AutoSubmitSelect>
      </div>

      <div className="field blog-toolbar__field">
        <label htmlFor="bt-tag">Tag</label>
        <AutoSubmitSelect id="bt-tag" name="tag" defaultValue={filter.tag ?? ""}>
          <option value="">All tags</option>
          {tags.map((tag) => (
            <option key={tag} value={tag}>
              {tagLabel(tag)}
            </option>
          ))}
        </AutoSubmitSelect>
      </div>

      <div className="blog-toolbar__actions">
        <button type="submit" className="btn btn--gold">
          Search
        </button>
        {hasActiveFilter && (
          <Link href="/blog" className="blog-toolbar__clear">
            Clear filters
          </Link>
        )}
      </div>
    </form>
  );
}
