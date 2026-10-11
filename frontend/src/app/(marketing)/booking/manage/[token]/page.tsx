import "@/styles/booking.css";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { PageHead } from "@/components/sections/PageHead";
import { Container } from "@/components/ui/Container";
import { StateBanner } from "@/components/ui/StateBanner";
import { ManageBookingView } from "@/components/booking/ManageBookingView";
import { bookingContainer } from "@/infrastructure/container";

// This page is unique per booking, contains the client's name/email/phone,
// and is reachable only by an unguessable token — it must never be indexed
// or appear in the sitemap.
export const metadata: Metadata = {
  title: "Manage Your Booking | ALLS Legal",
  robots: { index: false, follow: false },
};

export default async function ManageBookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ confirmed?: string }>;
}) {
  const { token } = await params;
  const { confirmed } = await searchParams;

  const result = await bookingContainer.getBookingByToken(token);
  const crumbs = [{ label: "Home", href: "/" }, { label: "Manage Booking" }];

  return (
    <>
      <SiteHeader />
      <main id="main">
        <PageHead
          breadcrumbs={crumbs}
          title="Manage Your"
          emphasis="Booking"
          description="View your appointment details, add it to your calendar, or reschedule and cancel here."
        />
        <section className="section booking-shell">
          <Container>
            {result.ok ? (
              <ManageBookingView initial={result.data} justConfirmed={confirmed === "1"} />
            ) : (
              <StateBanner variant="error" title="We couldn't find that booking">
                {result.error.message} If you followed a link from an email, please check it was copied in full.
              </StateBanner>
            )}
          </Container>
        </section>
      </main>
    </>
  );
}
