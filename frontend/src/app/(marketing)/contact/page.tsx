import { SiteHeader } from "@/components/layout/SiteHeader";
import { PageHead } from "@/components/sections/PageHead";
import { LogoStrip } from "@/components/sections/LogoStrip";
import { ContactCards } from "@/components/sections/ContactCards";
import { ContactForm } from "@/components/sections/ContactForm";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbList, contactPage } from "@/lib/seo/schema";
import { buildMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/config/site";

export const metadata = buildMetadata({
  title: "Contact",
  description: "Get in touch with ALLS — confidential consultations, response within 24 hours.",
  path: "/contact",
});

const crumbs = [{ label: "Home", href: "/" }, { label: "Contact" }];

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbList([{ name: "Home", path: "/" }, { name: "Contact" }]),
          contactPage(),
        ]}
      />
      <SiteHeader />
      <main id="main">
        <PageHead
          breadcrumbs={crumbs}
          title="Contact"
          emphasis="Us"
          description="Whatever your legal matter, our team is ready to listen. Reach out below and we'll respond within one business day."
        />
        <LogoStrip />
        <section className="section">
          <Container>
            <ContactCards />
            <div className="contact-grid">
              <Reveal>
                <Eyebrow>Contact Form</Eyebrow>
                <h2>Start Your Legal Journey</h2>
                <p>
                  Tell us briefly about your matter and we&apos;ll route you to the right attorney within one business
                  day.
                </p>
                <div className="contact-office">
                  <p>
                    <strong style={{ color: "var(--white)" }}>Office Hours</strong>
                    <br />
                    {siteConfig.officeHours.map((entry, i) => (
                      <span key={entry.day}>
                        {entry.day}: {entry.hours}
                        {i < siteConfig.officeHours.length - 1 && <br />}
                      </span>
                    ))}
                  </p>
                </div>
              </Reveal>
              <ContactForm />
            </div>
          </Container>
        </section>
      </main>
    </>
  );
}
