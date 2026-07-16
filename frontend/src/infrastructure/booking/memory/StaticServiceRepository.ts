import { services, serviceDurationMinutes } from "@/data/services";
import type { BookableService, ServiceRepository } from "@/application/booking/ports";

/**
 * Adapts the site's existing content data (data/services.ts) into the
 * booking-domain shape. "Static" because it reads a hardcoded array — the
 * Postgres swap-in later would query a `services` table instead, behind the
 * exact same interface.
 */
export class StaticServiceRepository implements ServiceRepository {
  private readonly items: BookableService[] = services.map((s) => ({
    slug: s.slug,
    title: s.title,
    durationMinutes: serviceDurationMinutes[s.slug] ?? 30,
  }));

  async findAll(): Promise<BookableService[]> {
    return this.items;
  }

  async findBySlug(slug: string): Promise<BookableService | undefined> {
    return this.items.find((s) => s.slug === slug);
  }
}
