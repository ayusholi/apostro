import type { Stat } from "@/types";

/** Identical on the home and About pages. */
export const stats: Stat[] = [
  { value: 45, suffix: "K+", label: "Clients Served" },
  { value: 98, suffix: "%", label: "Win Rate" },
  { value: 25, suffix: "+", label: "Years in Practice" },
  { value: 120, suffix: "+", label: "Expert Attorneys" },
];

/** Intrinsic dimensions preserved per-logo so CSS's `height:34px;width:auto` computes the right width for each. */
export const clientLogos = [
  { src: "/images/logo-client-1.png", width: 400, height: 100 },
  { src: "/images/logo-client-2.png", width: 232, height: 75 },
  { src: "/images/logo-client-3.png", width: 400, height: 94 },
  { src: "/images/logo-client-4.png", width: 400, height: 90 },
  { src: "/images/logo-client-5.png", width: 400, height: 160 },
];
