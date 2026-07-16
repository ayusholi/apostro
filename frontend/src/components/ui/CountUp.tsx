"use client";

import { useCountUp } from "@/hooks/useCountUp";

export function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const { ref, display } = useCountUp<HTMLSpanElement>(target, suffix);
  return <span ref={ref}>{display}</span>;
}
