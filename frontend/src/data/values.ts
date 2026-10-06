import type { ValueItem } from "@/types";

/** Mission/Vision wording is verbatim from the firm's business plan (30 July 2026) — do not paraphrase. */
const MISSION = "To deliver exceptional legal services through expertise, integrity, and innovation, ensuring every client receives partner‑level attention and client-focused advice.";
const VISION = "To become a highly recommended boutique law firm in London, known for its commitment to clients, excellent customer service and efficient service delivery, with a modern legal practice.";

/** Home page "About" section — Mission and Vision. */
export const valuesHome: ValueItem[] = [
  { number: "01", title: "Our Mission", description: MISSION },
  { number: "02", title: "Our Vision", description: VISION },
];

/** About page — Mission, Vision, and the firm's 5 named values. */
export const valuesAbout: ValueItem[] = [
  { number: "01", title: "Our Mission", description: MISSION },
  { number: "02", title: "Our Vision", description: VISION },
  { number: "03", title: "Professionalism", description: "Every matter is handled with the diligence and discretion clients have a right to expect from their solicitor." },
  { number: "04", title: "Client-Centric Service", description: "We shape our advice and availability around what actually works for you, not the other way around." },
  { number: "05", title: "Integrity and Transparency", description: "Clear fees, honest timelines, and advice you can rely on — even when it isn't what you hoped to hear." },
  { number: "06", title: "Innovation and Efficiency", description: "A modern legal practice that uses technology to work faster without cutting corners." },
  { number: "07", title: "Diversity and Inclusion", description: "A firm and a client base that reflect the community we're part of in East London." },
];
