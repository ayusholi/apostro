import { solicitors } from "@/data/solicitors";
import type { Solicitor, SolicitorRepository } from "@/application/booking/ports";

export class StaticSolicitorRepository implements SolicitorRepository {
  private readonly items: Solicitor[] = solicitors;

  async findAll(): Promise<Solicitor[]> {
    return this.items;
  }

  async findBySlug(slug: string): Promise<Solicitor | undefined> {
    return this.items.find((s) => s.slug === slug);
  }

  async findForService(serviceSlug: string): Promise<Solicitor[]> {
    return this.items.filter((s) => s.serviceSlugs.includes(serviceSlug));
  }
}
