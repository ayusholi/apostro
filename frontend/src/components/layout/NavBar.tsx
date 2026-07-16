"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDisclosure } from "@/hooks/useDisclosure";
import { Button } from "@/components/ui/Button";
import type { NavItem } from "@/types";

/**
 * Renders the center link list twice by design: `.nav-links` for the inline
 * desktop bar and `.mobile-nav__links` for the full-screen drawer. The two
 * need genuinely different layouts (horizontal bar vs. full-screen vertical
 * panel), so CSS `display` toggles which one the current breakpoint exposes
 * rather than repositioning one list to serve both — each is fully removed
 * from the accessibility tree (not just visually hidden) when its breakpoint
 * isn't active, so a screen reader only ever finds one "Primary" nav.
 */
export function NavBar({ items }: { items: NavItem[] }) {
  const { isOpen, toggle, close } = useDisclosure();
  const pathname = usePathname();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Never leave the drawer open across a navigation.
  useEffect(() => {
    close();
  }, [pathname, close]);

  // Lock background scroll while the full-screen drawer is open.
  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  // Focus management: move focus in on open, trap Tab within the drawer,
  // close on Escape, and return focus to the toggle button on close.
  useEffect(() => {
    if (!isOpen) return;
    const drawer = drawerRef.current;
    if (!drawer) return;

    const focusable = drawer.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        close();
        toggleRef.current?.focus();
        return;
      }
      if (e.key !== "Tab" || focusable.length === 0) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, close]);

  return (
    <>
      <nav className="nav-links" aria-label="Primary">
        {items.map((item) => (
          <Link key={item.href} href={item.href} aria-current={pathname === item.href ? "page" : undefined}>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="nav-actions">
        <Button href="/book" variant="gold" arrow className="nav-cta">
          <span className="nav-cta__full">Book a Consultation</span>
          <span className="nav-cta__short">Book Consultation</span>
        </Button>
        <button
          ref={toggleRef}
          className="menu-toggle"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
          aria-controls="mobile-nav"
          onClick={toggle}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <div id="mobile-nav" ref={drawerRef} className={isOpen ? "mobile-nav is-open" : "mobile-nav"}>
        <nav className="mobile-nav__links" aria-label="Mobile">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
              onClick={close}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Button href="/book" variant="gold" arrow className="mobile-nav__cta" onClick={close}>
          Book a Consultation
        </Button>
      </div>
    </>
  );
}
