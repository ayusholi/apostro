import type { ContentBlock } from "@/domain/blog/Post";

/**
 * Renders structured content blocks directly to JSX — no
 * dangerouslySetInnerHTML, no HTML/markdown parser. @see domain/blog/Post.ts
 * for why the content is shaped this way.
 */
export function ArticleBody({ body }: { body: ContentBlock[] }) {
  return (
    <div className="article-body">
      <p className="article-body__disclaimer">
        This article is for general information only and does not constitute legal advice. See our{" "}
        <a href="/legal/terms-and-conditions">Terms &amp; Conditions</a>.
      </p>

      {body.map((block, i) => {
        switch (block.type) {
          case "paragraph":
            return <p key={i}>{block.text}</p>;
          case "heading": {
            const Tag = block.level === 2 ? "h2" : "h3";
            return (
              <Tag key={i} id={block.id}>
                {block.text}
              </Tag>
            );
          }
          case "list":
            return (
              <ul key={i}>
                {block.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            );
          case "quote":
            return (
              <blockquote key={i}>
                <p>{block.text}</p>
                {block.attribution && <cite>{block.attribution}</cite>}
              </blockquote>
            );
        }
      })}
    </div>
  );
}
