import type { AuthorRepository } from "@/application/blog/ports";
import type { Author } from "@/domain/blog/Post";
import { authors } from "@/data/blog/authors";

export class StaticAuthorRepository implements AuthorRepository {
  async listAll(): Promise<Author[]> {
    return authors;
  }
}
