"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { NavBar } from "@/components/layout/NavBar";
import { Container } from "@/components/ui/Container";
import { siteConfig, mainNav } from "@/config/site";

/** Pixels scrolled before the floating header switches to its "scrolled" look. */
const SCROLL_THRESHOLD = 24;

/**
 * One shared header for every page — logo left, links centered, CTA right
 * (@see NavBar). Previously this rendered a different logo/wordmark on the
 * homepage vs. every other page; that split is gone so there's a single
 * navigation component and a single logo source everywhere.
 */
export function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;
    function apply() {
      setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
      ticking = false;
    }
    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(apply);
      }
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={isScrolled ? "site-header is-scrolled" : "site-header"}>
      <Container className="nav">
        <Link href="/" className="brand" aria-label={`${siteConfig.name} home`}>
          <Image className="brand-logo" src="/brand/all-solicitors-logo.svg" alt="" width={56} height={56} priority />
        </Link>
        <NavBar items={mainNav} />
      </Container>
    </header>
  );
}
