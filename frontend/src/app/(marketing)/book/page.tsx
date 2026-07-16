import "@/styles/booking.css";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { PageHead } from "@/components/sections/PageHead";
import { Container } from "@/components/ui/Container";
import { StateBanner } from "@/components/ui/StateBanner";
import { BookingWizard } from "@/components/booking/BookingWizard";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbList } from "@/lib/seo/schema";
import { buildMetadata } from "@/lib/seo/metadata";
import { bookingContainer } from "@/infrastructure/container";
import { getSolicitorBySlug } from "@/data/team/solicitors";

export const metadata = buildMetadata({
  title: "Book a Consultation",
  description: "Book a confidential consultation with an ALLS solicitor — choose your service, solicitor, office, and a time that works for you.",
  path: "/book",
});

const crumbs = [{ label: "Home", href: "/" }, { label: "Book a Consultation" }];

export default async function BookPage({ searchParams }: { searchParams: Promise<{ solicitor?: string }> }) {
  const { solicitor: solicitorSlug } = await searchParams;
  const [services, requestedSolicitor] = await Promise.all([
    bookingContainer.listServices(),
    solicitorSlug ? Promise.resolve(getSolicitorBySlug(solicitorSlug)) : Promise.resolve(undefined),
  ]);

  return (
    <>
      <JsonLd data={breadcrumbList([{ name: "Home", path: "/" }, { name: "Book a Consultation" }])} />
      <SiteHeader />
      <main id="main">
        <PageHead
          breadcrumbs={crumbs}
          title="Book a"
          emphasis="Consultation"
          description="Choose your service, solicitor, and a time that works for you. You'll receive an email confirmation with everything you need."
        />
        <section className="section booking-shell">
          <Container>
            {/* Purely informational — arriving from a solicitor's profile doesn't
                pre-select anything in the wizard below (that stateful flow starts
                with service selection either way), it just confirms who the
                visitor meant to book with and what to pick in the Solicitor step. */}
            {requestedSolicitor && (
              <StateBanner variant="success" title={`Booking with ${requestedSolicitor.name}`}>
                Choose a service below, then select {requestedSolicitor.name} in the solicitor step to continue with
                them.
              </StateBanner>
            )}
            <BookingWizard services={services} />
          </Container>
        </section>
      </main>
    </>
  );
}
