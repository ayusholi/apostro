import type { BookableService, Office, OfficeRepository, ServiceRepository, Solicitor, SolicitorRepository } from "../ports";

export type CatalogDeps = {
  services: ServiceRepository;
  solicitors: SolicitorRepository;
  offices: OfficeRepository;
};

/** Step 1 of the wizard: every bookable service. */
export async function listServices(deps: Pick<CatalogDeps, "services">): Promise<BookableService[]> {
  return deps.services.findAll();
}

/** Step 2: only solicitors who handle the chosen service. */
export async function listSolicitorsForService(
  deps: Pick<CatalogDeps, "solicitors">,
  serviceSlug: string,
): Promise<Solicitor[]> {
  return deps.solicitors.findForService(serviceSlug);
}

/** Step 3: only offices the chosen solicitor actually works from. */
export async function listOfficesForSolicitor(
  deps: Pick<CatalogDeps, "offices">,
  solicitorSlug: string,
): Promise<Office[]> {
  return deps.offices.findForSolicitor(solicitorSlug);
}
