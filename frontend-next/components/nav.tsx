"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Price } from "./price";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 md:px-14 py-5 transition-[background-color,border-color] duration-400 border-b ${
        scrolled
          ? "bg-ink/95 backdrop-blur-xl border-cream/[0.06]"
          : "bg-transparent border-transparent"
      }`}
    >
      <Link
        href="/"
        className="font-display font-light text-[22px] tracking-[0.22em] uppercase text-cream"
      >
        Trail<span className="text-muted">Flow</span>
      </Link>

      <div className="flex items-center gap-8">
        <Link
          href="#features"
          className="hidden md:inline text-[11px] font-light tracking-[0.18em] uppercase text-muted-lt hover:text-cream transition-colors"
        >
          Le produit
        </Link>
        <Link
          href="#proof"
          className="hidden md:inline text-[11px] font-light tracking-[0.18em] uppercase text-muted-lt hover:text-cream transition-colors"
        >
          Avis
        </Link>
        <div className="hidden md:block">
          <Price variant="nav" />
        </div>
        <Link
          href="/product/trailflow"
          className="text-[11px] font-light tracking-[0.14em] uppercase text-ink bg-cream px-6 py-3 rounded-[2px] hover:opacity-85 transition-opacity"
        >
          Commander
        </Link>
      </div>
    </nav>
  );
}
