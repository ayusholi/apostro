import type { Stat } from "@/types";

/** "Why choose us" reasons — from the firm's business plan (30 July 2026). Identical on the home and About pages. */
export const stats: Stat[] = [
  { title: "Partner-Led Service", description: "Direct access to a Director-level solicitor on your matter, not a junior handling it alone." },
  { title: "Competitive Pricing", description: "Fixed-fee packages, hourly rates, or retainers, agreed upfront, with no hidden costs." },
  { title: "Faster Turnaround", description: "A boutique firm's focus, without the delays of a larger practice's case load." },
  { title: "Specialist Expertise", description: "Deep experience across litigation, family law, property conveyance, and private client matters." },
  { title: "Modern, Tech-Enabled Working", description: "A secure client portal and encrypted communications, so your matter moves without unnecessary paperwork." },
];

/** Intrinsic dimensions preserved per-logo so CSS's `height:34px;width:auto` computes the right width for each. */
export const clientLogos = [
  { src: "/images/logo-client-1.png", width: 400, height: 100 },
  { src: "/images/logo-client-2.png", width: 232, height: 75 },
  { src: "/images/logo-client-3.png", width: 400, height: 94 },
  { src: "/images/logo-client-4.png", width: 400, height: 90 },
  { src: "/images/logo-client-5.png", width: 400, height: 160 },
];
