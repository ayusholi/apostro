import type { ReactNode } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";

export type Crumb = { label: string; href?: string };

/**
 * Inner-page hero + breadcrumb.
 *
 * The breadcrumb is now a real `<nav aria-label="Breadcrumb">` containing an
 * ordered list, with the current page marked `aria-current="page"`. This is
 * the on-page counterpart to the BreadcrumbList JSON-LD each page emits — both
 * are driven from the same `breadcrumbs` array, so the visible trail and the
 * structured data can never drift apart (a common cause of Search Console
 * "breadcrumb mismatch" warnings). Styled to render identically to the
 * original inline "Home / X" trail.
 */
export function PageHead({
  breadcrumbs,
  title,
  emphasis,
  description,
}: {
  breadcrumbs: Crumb[];
  title: string;
  emphasis: string;
  description: ReactNode;
}) {
  return (
    <section className="page-head">
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
        <h1>
          {title} <em>{emphasis}</em>
        </h1>
        <p>{description}</p>
      </Container>
    </section>
  );
}
