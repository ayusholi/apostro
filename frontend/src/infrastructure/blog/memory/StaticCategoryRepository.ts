import type { CategoryRepository } from "@/application/blog/ports";
import type { Category } from "@/domain/blog/Post";
import { categories } from "@/data/blog/categories";

export class StaticCategoryRepository implements CategoryRepository {
  async listAll(): Promise<Category[]> {
    return categories;
  }
}
