"use client";

import { useEffect, useState } from "react";

/** Which of these heading ids is currently in view — drives the table of contents' active-item highlight. */
export function useActiveHeading(ids: string[]): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);
  // Stable across re-renders as long as the actual ids don't change, unlike
  // the `ids` array reference itself.
  const key = ids.join(",");

  useEffect(() => {
    const elements = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const firstVisible = entries.find((entry) => entry.isIntersecting);
        if (firstVisible) setActiveId(firstVisible.target.id);
      },
      { rootMargin: "0px 0px -70% 0px" },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `key` is the intentional stable proxy for `ids`
  }, [key]);

  return activeId;
}
