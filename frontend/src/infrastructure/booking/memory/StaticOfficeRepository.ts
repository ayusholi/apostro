import { offices } from "@/data/offices";
import { solicitors } from "@/data/solicitors";
import type { Office, OfficeRepository } from "@/application/booking/ports";

export class StaticOfficeRepository implements OfficeRepository {
  private readonly items: Office[] = offices;

  async findAll(): Promise<Office[]> {
    return this.items;
  }

  async findById(id: string): Promise<Office | undefined> {
    return this.items.find((o) => o.id === id);
  }

  async findForSolicitor(solicitorSlug: string): Promise<Office[]> {
    const solicitor = solicitors.find((s) => s.slug === solicitorSlug);
    if (!solicitor) return [];
    return this.items.filter((o) => solicitor.officeIds.includes(o.id));
  }
}
