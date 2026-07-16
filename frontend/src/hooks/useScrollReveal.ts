"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/** Replaces script.js's IntersectionObserver reveal-on-scroll behaviour. */
export function useScrollReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [hasIntersected, setHasIntersected] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node || prefersReducedMotion) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setHasIntersected(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  return { ref, isVisible: prefersReducedMotion || hasIntersected };
}
