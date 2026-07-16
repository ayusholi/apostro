import type { Solicitor } from "@/domain/team/Solicitor";

/** Read-only today (static/in-memory data) — same swap story as booking/reviews/blog. @see team/README or infrastructure/teamContainer.ts. */
export interface SolicitorRepository {
  listAll(): Promise<Solicitor[]>;
}
