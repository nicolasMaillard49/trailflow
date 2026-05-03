"use client";

import { useEffect, useState } from "react";

/**
 * Bouton "Commander" flottant.
 * - Apparaît dès qu'on a scrollé > 30% de la page
 * - Disparaît dès qu'on atteint la section .cta-section (le CTA principal est déjà visible)
 */
export function FloatingCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const total = h.scrollHeight - h.clientHeight;
      if (total <= 0) return setVisible(false);
      const progress = h.scrollTop / total;

      // Cache si on a atteint la cta-section
      const cta = document.querySelector(".cta-section");
      if (cta) {
        const rect = cta.getBoundingClientRect();
        // dès que le top de cta-section entre dans la moitié basse du viewport, on cache
        if (rect.top < window.innerHeight) return setVisible(false);
      }

      setVisible(progress > 0.3);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <a
      href="/produit"
      className={`floating-cta${visible ? " visible" : ""}`}
      aria-hidden={!visible}
    >
      Commander
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    </a>
  );
}
