import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { getServiceBySlug } from "@/data/services";
import type { Solicitor } from "@/domain/team/Solicitor";

export function SolicitorCard({ solicitor }: { solicitor: Solicitor }) {
  return (
    <Reveal as="article" className="t-member">
      <Link href={`/solicitors/${solicitor.slug}`} aria-label={`View ${solicitor.name}'s profile`}>
        <Image src={solicitor.image} alt={solicitor.name} fill sizes="(max-width: 768px) 100vw, 25vw" />
      </Link>
      <div className="t-member__info">
        <h4>
          <Link href={`/solicitors/${solicitor.slug}`}>{solicitor.name}</Link>
        </h4>
        <span>{solicitor.role}</span>
        <div className="t-member__areas">
          {solicitor.practiceAreaSlugs.slice(0, 2).map((slug) => {
            const service = getServiceBySlug(slug);
            return service ? (
              <span key={slug} className="t-member__area">
                {service.title}
              </span>
            ) : null;
          })}
        </div>
      </div>
    </Reveal>
  );
}
