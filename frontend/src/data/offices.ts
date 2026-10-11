import { siteConfig } from "@/config/site";

export type OfficeData = {
  id: string;
  name: string;
  address: string;
  timeZone: string;
};

/**
 * Only one real office exists in this site's content (see siteConfig) — the
 * booking flow's office step is built to support N offices, seeded honestly
 * with the one that's real rather than inventing fictional branches.
 */
export const offices: OfficeData[] = [
  {
    id: "20-store-street",
    name: `${siteConfig.name} - Stratford`,
    address: siteConfig.address,
    timeZone: "Europe/London",
  },
];
