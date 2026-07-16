import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/config/site";

export function CtaBanner() {
  return (
    <section className="section--tight">
      <Container>
        <Reveal className="cta">
          <div className="cta__grid">
            <div>
              <Eyebrow>Protect Your Rights Today</Eyebrow>
              <h2>Schedule a confidential consultation</h2>
              <p>
                Speak directly with a qualified solicitor about your situation — no jargon, no obligation, and
                everything you share stays strictly confidential.
              </p>
            </div>
            <div className="cta__actions">
              <div className="cta__phone">
                <small>Call Us Now</small>
                {siteConfig.phone}
              </div>
              {/* This banner's own copy is "Schedule a confidential consultation" —
                  now that a real booking flow exists, it should lead there
                  rather than to the general contact form. */}
              <Button href="/book" variant="gold" arrow>
                Book Your Consultation
              </Button>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
