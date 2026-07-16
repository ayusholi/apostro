import { SiteFooter } from "@/components/layout/SiteFooter";

/**
 * Only the footer is shared here — the header is identical on every page now
 * (@see SiteHeader), but each top-level page still renders its own
 * <SiteHeader /> before this layout's {children} rather than hoisting it here,
 * since not-found.tsx sits outside every route group and composes the same
 * header directly.
 */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <SiteFooter />
    </>
  );
}
