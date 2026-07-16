import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { TrustBadges } from "@/components/ui/TrustBadges";
import { CookiePreferencesLink } from "@/components/legal/CookiePreferencesLink";
import { siteConfig, footerNav, footerQuickLinks, footerLegalNav } from "@/config/site";
import { legalConfig } from "@/config/legal";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <Container>
        <div className="footer__top">
          <div className="footer__brand">
            <Link href="/" className="brand">
              <Image className="brand-logo" src="/brand/logo.png" alt="" width={56} height={56} />
              <span className="brand-text">{siteConfig.name.toUpperCase()}</span>
            </Link>
            <p>Let&apos;s make things happen — contact us today and take the first step toward resolution.</p>
            <div className="footer__social">
              <a href={siteConfig.social.facebook} aria-label="Facebook">
                f
              </a>
              <a href={siteConfig.social.twitter} aria-label="Twitter">
                𝕏
              </a>
              <a href={siteConfig.social.youtube} aria-label="YouTube">
                ▶
              </a>
            </div>
          </div>
          <nav aria-label="Footer">
            <h5>Navigation</h5>
            {footerNav.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
          <nav aria-label="Quick links">
            <h5>Quick Links</h5>
            {footerQuickLinks.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
          <nav aria-label="Legal">
            <h5>Legal</h5>
            {footerLegalNav.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div>
            <h5>Contact</h5>
            <a href={siteConfig.phoneHref}>{siteConfig.phone}</a>
            <a href={siteConfig.emailHref}>{siteConfig.email}</a>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(siteConfig.address)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {siteConfig.address}
            </a>
            <div className="footer__hours">
              {siteConfig.officeHours.map((entry) => (
                <span key={entry.day}>
                  {entry.day}: {entry.hours}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="footer__compliance">
          <TrustBadges compact />
          <p>
            {legalConfig.tradingDisclosure} is registered in {legalConfig.jurisdiction}, company no.{" "}
            {legalConfig.companyNumber}. Registered office: {siteConfig.address}. {legalConfig.sra.statement} (SRA No.{" "}
            {legalConfig.sra.number}) — you can check this on the{" "}
            <a href={legalConfig.sra.website} target="_blank" rel="noopener noreferrer">
              SRA register
            </a>
            .
          </p>
        </div>

        <div className="footer__bot">
          <span>
            © <span>{year}</span> {siteConfig.name}. All rights reserved.
          </span>
          <CookiePreferencesLink />
          <span>
            {siteConfig.name} — {siteConfig.tagline}
          </span>
        </div>
      </Container>
    </footer>
  );
}
