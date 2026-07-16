"use client";

import type { ReactNode, Ref } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

type Tag = "div" | "article";

export function Reveal({
  children,
  as = "div",
  className,
}: {
  children: ReactNode;
  as?: Tag;
  className?: string;
}) {
  const { ref, isVisible } = useScrollReveal<HTMLElement>();
  const classes = ["reveal", isVisible && "is-visible", className].filter(Boolean).join(" ");
  const Element = as;

  return (
    <Element ref={ref as Ref<HTMLDivElement>} className={classes}>
      {children}
    </Element>
  );
}
