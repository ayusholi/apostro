"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/** Replaces script.js's ease-in-out number counter, triggered once in view. */
export function useCountUp<T extends HTMLElement>(target: number, suffix = "", duration = 1400) {
  const ref = useRef<T | null>(null);
  const [display, setDisplay] = useState(`0${suffix}`);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node || prefersReducedMotion) return;

    let started = false;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !started) {
            started = true;
            const start = performance.now();
            const tick = (now: number) => {
              const p = Math.min(1, (now - start) / duration);
              const value = Math.floor(target * (0.5 - Math.cos(Math.PI * p) / 2));
              setDisplay(`${value.toLocaleString()}${suffix}`);
              if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          }
        });
      },
      { threshold: 0.5 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [target, suffix, duration, prefersReducedMotion]);

  return { ref, display: prefersReducedMotion ? `${target.toLocaleString()}${suffix}` : display };
}
