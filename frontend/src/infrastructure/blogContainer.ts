/**
 * Composition root for the blog feature (mirrors container.ts for booking
 * and reviewsContainer.ts for reviews). To connect a CMS later: implement
 * `PostRepository`/`AuthorRepository`/`CategoryRepository` against it in
 * infrastructure/blog/<cms-name>/, then swap the three `new Static*` lines
 * below. No use case or component change required — @see blog/README.md.
 */
import { StaticPostRepository } from "./blog/memory/StaticPostRepository";
import { StaticAuthorRepository } from "./blog/memory/StaticAuthorRepository";
import { StaticCategoryRepository } from "./blog/memory/StaticCategoryRepository";
import { makeListPosts } from "@/application/blog/use-cases/listPosts";
import { makeGetPostDetail } from "@/application/blog/use-cases/getPostDetail";
import { makeGetAuthorProfile } from "@/application/blog/use-cases/getAuthorProfile";

const postRepository = new StaticPostRepository();
const authorRepository = new StaticAuthorRepository();
const categoryRepository = new StaticCategoryRepository();

export const blogContainer = {
  listPosts: makeListPosts(postRepository, categoryRepository),
  getPostDetail: makeGetPostDetail(postRepository, authorRepository, categoryRepository),
  getAuthorProfile: makeGetAuthorProfile(postRepository, authorRepository),
  // Raw passthroughs — used only for generateStaticParams, where there's no
  // business logic to apply, just "every known slug".
  listAllPosts: () => postRepository.listAll(),
  listAllAuthors: () => authorRepository.listAll(),
};
