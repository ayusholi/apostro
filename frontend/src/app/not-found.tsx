import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you are looking for could not be found.",
};

/**
 * Self-contained rather than routed through (marketing)/layout.tsx: an
 * unmatched path resolves outside every route group, so a group layout's
 * <SiteFooter/> would never actually render here. Header + footer are
 * composed directly instead, same components, same result.
 */
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <section className="err">
          <Container>
            <div className="err__code" aria-hidden="true">404</div>
            <h1>Page Not Found</h1>
            <p>The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
            <Button href="/" variant="gold" arrow style={{ marginTop: 18 }}>
              Back to Home
            </Button>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
