import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHead } from "@/components/ui/SectionHead";
import { Reveal } from "@/components/ui/Reveal";
import { TrustBadges } from "@/components/ui/TrustBadges";
import { siteConfig } from "@/config/site";
import { legalConfig } from "@/config/legal";

export function RegulatoryInfoSection() {
  return (
    <section className="section section--tight regulatory-info">
      <Container>
        <SectionHead
          eyebrow="Regulatory Information"
          title="Regulated, Accountable, and Insured"
          description="What it means to be a firm of solicitors in England and Wales, and where to check for yourself."
        />

        <div className="regulatory-info__grid">
          <Reveal className="regulatory-info__card">
            <h3>Regulation</h3>
            <p>
              {legalConfig.sra.statement} (SRA No. {legalConfig.sra.number}). {legalConfig.lawSociety.statement}.
            </p>
            <p>We hold professional indemnity insurance covering our legal services, as required by the SRA Standards and Regulations.</p>
          </Reveal>

          <Reveal className="regulatory-info__card">
            <h3>Law Society accreditations</h3>
            <ul>
              {legalConfig.accreditations.map((accreditation) => (
                <li key={accreditation.name}>
                  <strong>{accreditation.name}</strong> — {accreditation.description}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal className="regulatory-info__card">
            <h3>Company details</h3>
            <p>
              {legalConfig.tradingDisclosure}, company number {legalConfig.companyNumber}, registered in{" "}
              {legalConfig.jurisdiction}.
            </p>
            <p>Registered office: {siteConfig.address}. VAT number: {legalConfig.vatNumber}.</p>
          </Reveal>

          <Reveal className="regulatory-info__card">
            <h3>If something goes wrong</h3>
            <p>
              Read our <Link href="/legal/complaints-procedure">Complaints Procedure</Link> for how to raise a
              concern with us directly, and how to escalate it to the {legalConfig.legalOmbudsman.name} if we can&apos;t
              resolve it between us.
            </p>
          </Reveal>
        </div>

        <TrustBadges />
      </Container>
    </section>
  );
}
