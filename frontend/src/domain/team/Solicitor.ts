/**
 * The canonical record of "who works here" — the single source of truth
 * booking (scheduling metadata only) and this directory (public profile)
 * both key off by `slug`, rather than two independently maintained people
 * lists that can drift apart. @see src/data/team/solicitors.ts.
 */
export type Solicitor = {
  slug: string;
  name: string;
  /** Job title shown on the profile, e.g. "Senior Partner, Criminal Defense". */
  role: string;
  image: string;
  bio: string;
  /** e.g. "LLB (Hons), University of Manchester" — shown verbatim, in order. */
  qualifications: string[];
  /** References src/data/services.ts slugs. */
  practiceAreaSlugs: string[];
  languages: string[];
  experienceYears: number;
  memberships: string[];
  email: string;
  /** Direct line — falls back to the firm's main number if not set. */
  phone?: string;
};
