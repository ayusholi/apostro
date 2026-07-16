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
  { slug: "john-doe", officeIds: ["london-eye"], workingHours: standardWeek },
  {
    slug: "david-john",
    officeIds: ["london-eye"],
    // Half-day Friday.
    workingHours: { ...standardWeek, 5: { start: "09:00", end: "13:00" } },
  },
  { slug: "gacia-smith", officeIds: ["london-eye"], workingHours: standardWeek },
  { slug: "trevor-king", officeIds: ["london-eye"], workingHours: standardWeek },
  {
    slug: "seo-in-guk",
    officeIds: ["london-eye"],
    // Later start, later finish.
    workingHours: {
      1: { start: "10:00", end: "18:00" },
      2: { start: "10:00", end: "18:00" },
      3: { start: "10:00", end: "18:00" },
      4: { start: "10:00", end: "18:00" },
      5: { start: "10:00", end: "18:00" },
    },
  },
  {
    slug: "karina-l",
    officeIds: ["london-eye"],
    // Works Tuesday–Saturday instead of the standard week.
    workingHours: {
      2: { start: "09:00", end: "17:00" },
      3: { start: "09:00", end: "17:00" },
      4: { start: "09:00", end: "17:00" },
      5: { start: "09:00", end: "17:00" },
      6: { start: "10:00", end: "14:00" },
    },
  },
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
