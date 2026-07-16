import { Reveal } from "@/components/ui/Reveal";
import { siteConfig } from "@/config/site";

export function ContactCards() {
  return (
    <div className="contact-cards">
      <Reveal className="contact-card">
        <div className="ico">☎</div>
        <strong>
          <a href={siteConfig.phoneHref}>{siteConfig.phone}</a>
        </strong>
        <p>Mon–Fri, 9am – 6pm</p>
      </Reveal>
      <Reveal className="contact-card">
        <div className="ico">✉</div>
        <strong>
          <a href={siteConfig.emailHref}>{siteConfig.email}</a>
        </strong>
        <p>We respond within 24 hours.</p>
      </Reveal>
      <Reveal className="contact-card">
        <div className="ico">⚓</div>
        <strong>{siteConfig.address}</strong>
        <p>Walk-ins welcome by appointment.</p>
      </Reveal>
    </div>
  );
}
