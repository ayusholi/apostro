import Link from "next/link";

function hrefFor(basePath: string, baseParams: URLSearchParams, page: number): string {
  const params = new URLSearchParams(baseParams);
  if (page <= 1) params.delete("page");
  else params.set("page", String(page));
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

/**
 * Generic GET-based pagination — reused by /reviews and /blog. `searchParams`
 * should have `page` already stripped by the caller, since this component
 * owns that param exclusively.
 */
export function Pagination({
  page,
  pageCount,
  basePath,
  searchParams,
  ariaLabel,
}: {
  page: number;
  pageCount: number;
  basePath: string;
  searchParams: URLSearchParams;
  ariaLabel: string;
}) {
  if (pageCount <= 1) return null;

  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

  return (
    <nav className="pagination" aria-label={ariaLabel}>
      {page <= 1 ? (
        <span className="pagination__nav is-disabled" aria-disabled="true">← Previous</span>
      ) : (
        <Link href={hrefFor(basePath, searchParams, page - 1)} className="pagination__nav" rel="prev">
          ← Previous
        </Link>
      )}

      <ol className="pagination__pages">
        {pages.map((p) => (
          <li key={p}>
            <Link
              href={hrefFor(basePath, searchParams, p)}
              aria-current={p === page ? "page" : undefined}
              className={p === page ? "is-current" : undefined}
            >
              {p}
            </Link>
          </li>
        ))}
      </ol>

      {page >= pageCount ? (
        <span className="pagination__nav is-disabled" aria-disabled="true">Next →</span>
      ) : (
        <Link href={hrefFor(basePath, searchParams, page + 1)} className="pagination__nav" rel="next">
          Next →
        </Link>
      )}
    </nav>
  );
}
