import type { WorkingHours } from "@/domain/scheduling/workingHours";
import { getSolicitorBySlug } from "@/data/team/solicitors";

export type SolicitorData = {
  slug: string;
  name: string;
  image: string;
  serviceSlugs: string[];
  officeIds: string[];
  workingHours: WorkingHours;
};


const standardWeek: WorkingHours = {
  1: { start: "09:00", end: "17:00" },
  2: { start: "09:00", end: "17:00" },
  3: { start: "09:00", end: "17:00" },
  4: { start: "09:00", end: "17:00" },
  5: { start: "09:00", end: "17:00" },
};

/**
 * Booking-only scheduling metadata (which office, and when) — the original
 * site never specified this, so it's a reasonable default, not sourced
 * content. Identity (name/image) and which services each solicitor handles
 * now come from src/data/team/solicitors.ts, the firm's one canonical people
 * list, instead of being duplicated here.
 */
const scheduling: { slug: string; officeIds: string[]; workingHours: WorkingHours }[] = [
  { slug: "wayne-bell", officeIds: ["london-eye"], workingHours: standardWeek },
  { slug: "anne-key", officeIds: ["london-eye"], workingHours: standardWeek },
];

export const solicitors: SolicitorData[] = scheduling.map(({ slug, officeIds, workingHours }) => {
  const person = getSolicitorBySlug(slug);
  if (!person) throw new Error(`Booking scheduling data references unknown solicitor slug: ${slug}`);
  return {
    slug: person.slug,
    name: person.name,
    image: person.image,
    serviceSlugs: person.practiceAreaSlugs,
    officeIds,
    workingHours,
  };
});
