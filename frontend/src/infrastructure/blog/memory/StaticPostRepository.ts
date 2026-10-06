import type { PostRepository } from "@/application/blog/ports";
import { isPublished, type Post } from "@/domain/blog/Post";
import { posts } from "@/data/blog/posts";

export class StaticPostRepository implements PostRepository {
  async listAll(): Promise<Post[]> {
    return posts.filter(isPublished);
  }
}
