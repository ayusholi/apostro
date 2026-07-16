import type { SolicitorRepository } from "@/application/team/ports";
import type { Solicitor } from "@/domain/team/Solicitor";
import { solicitors } from "@/data/team/solicitors";

export class StaticSolicitorRepository implements SolicitorRepository {
  async listAll(): Promise<Solicitor[]> {
    return solicitors;
  }
}
