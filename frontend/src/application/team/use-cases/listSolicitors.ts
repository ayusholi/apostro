import type { SolicitorRepository } from "@/application/team/ports";
import type { Solicitor } from "@/domain/team/Solicitor";

export function makeListSolicitors(repo: SolicitorRepository) {
  return function listSolicitors(): Promise<Solicitor[]> {
    return repo.listAll();
  };
}
