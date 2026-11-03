import type { Metadata } from "next";
import { Later } from "@/components/workspace/Later";

/** Secondary destinations that are intentionally out of scope for this phase. */
const SECTIONS = {
  calendar: { title: "Calendar", text: "A shared diary for appointments, hearings and recorded key dates. Today’s diary is already shown on My Work." },
  reports: { title: "Reports", text: "Workload, time recorded and matter ageing for the firm. Planned for a later phase." },
  team: { title: "Team", text: "Fee earners, supervisors and availability. Planned for a later phase." },
  settings: { title: "Settings", text: "Matter types, stages, templates and channel connections. Planned for a later phase." },
} as const;

type Section = keyof typeof SECTIONS;

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(SECTIONS).map((section) => ({ section }));
}

export async function generateMetadata({ params }: { params: Promise<{ section: Section }> }): Promise<Metadata> {
  const { section } = await params;
  return { title: SECTIONS[section].title };
}

export default async function SectionPage({ params }: { params: Promise<{ section: Section }> }) {
  const { section } = await params;
  return <Later {...SECTIONS[section]} />;
}
