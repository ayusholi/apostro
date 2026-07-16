import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { getServiceBySlug } from "@/data/services";
import { siteConfig } from "@/config/site";
import type { Solicitor } from "@/domain/team/Solicitor";

export function SolicitorDetails({ solicitor }: { solicitor: Solicitor }) {
  return (
    <section className="section">
      <Container>
        <div className="solicitor-bio">
          <h2>Biography</h2>
          <p>{solicitor.bio}</p>
        </div>

        <div className="regulatory-info__grid solicitor-details__grid">
          <div className="regulatory-info__card">
            <h3>Practice Areas</h3>
            <ul>
              {solicitor.practiceAreaSlugs.map((slug) => {
                const service = getServiceBySlug(slug);
                return service ? (
                  <li key={slug}>
                    <Link href={`/services/${slug}`}>{service.title}</Link>
                  </li>
                ) : null;
              })}
            </ul>
          </div>

          <div className="regulatory-info__card">
            <h3>Qualifications</h3>
            <ul>
              {solicitor.qualifications.map((qualification) => (
                <li key={qualification}>{qualification}</li>
              ))}
            </ul>
          </div>

          <div className="regulatory-info__card">
            <h3>Languages Spoken</h3>
            <ul>
              {solicitor.languages.map((language) => (
                <li key={language}>{language}</li>
              ))}
            </ul>
          </div>

          <div className="regulatory-info__card">
            <h3>Professional Memberships</h3>
            <ul>
              {solicitor.memberships.map((membership) => (
                <li key={membership}>{membership}</li>
              ))}
            </ul>
          </div>

          <div className="regulatory-info__card">
            <h3>Contact</h3>
            <p>
              <a href={`mailto:${solicitor.email}`}>{solicitor.email}</a>
            </p>
            <p>
              <a href={siteConfig.phoneHref}>{solicitor.phone ?? siteConfig.phone}</a>
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
