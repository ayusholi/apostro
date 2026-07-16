"use client";

import { useActiveHeading } from "@/hooks/useActiveHeading";
import type { TocEntry } from "@/domain/blog/tableOfContents";

export function TableOfContents({ entries }: { entries: TocEntry[] }) {
  const activeId = useActiveHeading(entries.map((entry) => entry.id));

  if (entries.length === 0) return null;

  return (
    <nav className="toc" aria-label="Table of contents">
      <h2 className="toc__title">On this page</h2>
      <ol>
        {entries.map((entry) => (
          <li key={entry.id} className={entry.level === 3 ? "toc__sub" : undefined}>
            <a href={`#${entry.id}`} aria-current={activeId === entry.id ? "location" : undefined}>
              {entry.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
