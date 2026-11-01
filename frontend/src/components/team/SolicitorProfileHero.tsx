import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import type { Crumb } from "@/components/sections/PageHead";
import type { Solicitor } from "@/domain/team/Solicitor";

export function SolicitorProfileHero({ solicitor, breadcrumbs }: { solicitor: Solicitor; breadcrumbs: Crumb[] }) {
  return (
    <section className="article-hero solicitor-hero">
      <Container>
        <nav className="crumbs" aria-label="Breadcrumb">
          <ol>
            {breadcrumbs.map((crumb) => (
              <li key={crumb.label} {...(crumb.href ? {} : { "aria-current": "page" as const })}>
                {crumb.href ? <Link href={crumb.href}>{crumb.label}</Link> : crumb.label}
              </li>
            ))}
          </ol>
        </nav>

        <div className="solicitor-hero__row">
          <Image src={solicitor.image} alt={solicitor.name} width={140} height={140} className="solicitor-hero__photo" />
          <div>
            <h1>{solicitor.name}</h1>
            <p className="solicitor-hero__role">{solicitor.role} (2022)</p>
            <p className="solicitor-hero__meta">
              {solicitor.languages.join(", ")}
            </p>
            <Button href={`/book?solicitor=${solicitor.slug}`} variant="gold" arrow>
              Book a Consultation
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
