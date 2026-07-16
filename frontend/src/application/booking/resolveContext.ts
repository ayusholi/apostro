import { UnknownOfficeError, UnknownServiceError, UnknownSolicitorError } from "@/domain/booking/errors";
import type { BookableService, Office, OfficeRepository, ServiceRepository, Solicitor, SolicitorRepository } from "./ports";

export type BookingContext = { service: BookableService; solicitor: Solicitor; office: Office };

/**
 * Every mutating use case needs to re-verify service/solicitor/office
 * actually exist AND are mutually compatible server-side — never trust that
 * a client only submitted what the wizard's own filtering allowed.
 */
export async function resolveBookingContext(
  repos: { services: ServiceRepository; solicitors: SolicitorRepository; offices: OfficeRepository },
  ids: { serviceSlug: string; solicitorSlug: string; officeId: string },
): Promise<BookingContext> {
  const service = await repos.services.findBySlug(ids.serviceSlug);
  if (!service) throw new UnknownServiceError();

  const solicitor = await repos.solicitors.findBySlug(ids.solicitorSlug);
  if (!solicitor || !solicitor.serviceSlugs.includes(ids.serviceSlug)) throw new UnknownSolicitorError();

  const office = await repos.offices.findById(ids.officeId);
  if (!office || !solicitor.officeIds.includes(ids.officeId)) throw new UnknownOfficeError();

  return { service, solicitor, office };
}
