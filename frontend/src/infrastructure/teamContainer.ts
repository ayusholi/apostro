/**
 * Composition root for the solicitor directory (mirrors container.ts,
 * reviewsContainer.ts, blogContainer.ts). To connect a CMS later: implement
 * `SolicitorRepository` in infrastructure/team/<cms-name>/, then swap the
 * one `new StaticSolicitorRepository()` line below. No use case or
 * component change required.
 *
 * getSolicitorProfile also depends on the blog and reviews repositories, to
 * cross-reference a solicitor's authored articles and named reviews — fresh
 * instances here are harmless (both are stateless, in-memory reads), and
 * keeps every container self-contained rather than exporting internals
 * between them.
 */
import { StaticSolicitorRepository } from "./team/memory/StaticSolicitorRepository";
import { StaticPostRepository } from "./blog/memory/StaticPostRepository";
import { StaticReviewRepository } from "./reviews/memory/StaticReviewRepository";
import { makeListSolicitors } from "@/application/team/use-cases/listSolicitors";
import { makeGetSolicitorProfile } from "@/application/team/use-cases/getSolicitorProfile";

const solicitorRepository = new StaticSolicitorRepository();
const postRepository = new StaticPostRepository();
const reviewRepository = new StaticReviewRepository();

export const teamContainer = {
  listSolicitors: makeListSolicitors(solicitorRepository),
  getSolicitorProfile: makeGetSolicitorProfile(solicitorRepository, postRepository, reviewRepository),
};
