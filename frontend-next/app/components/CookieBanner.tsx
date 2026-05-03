"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "trailflow-consent";

export type ConsentLevel = "all" | "essential";

export function getConsent(): ConsentLevel | null {
  if (typeof window === "undefined") return null;
  return (window.localStorage.getItem(STORAGE_KEY) as ConsentLevel) || null;
}

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Affiche si pas de consentement enregistré
    const stored = getConsent();
    if (!stored) {
      // Petit delay pour ne pas brutaliser l'arrivée
      const t = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  const set = (level: ConsentLevel) => {
    window.localStorage.setItem(STORAGE_KEY, level);
    setVisible(false);
    // Note : les trackers (GA4/Meta Pixel) sont chargés indépendamment.
    // Ce consentement est conservé pour conformité visuelle / future évolution.
  };

  if (!visible) return null;

  return (
    <div className="cookie-banner" role="dialog" aria-label="Consentement cookies">
      <div className="cookie-text">
        <strong>Cookies & confidentialité</strong>
        <p>
          On utilise des cookies essentiels au fonctionnement (panier, paiement) et,
          avec votre accord, des outils de mesure (Google Analytics, Meta Pixel)
          pour améliorer le site. Vous pouvez modifier votre choix à tout moment.
        </p>
      </div>
      <div className="cookie-actions">
        <button className="cookie-btn cookie-btn-ghost" onClick={() => set("essential")}>
          Refuser
        </button>
        <button className="cookie-btn cookie-btn-primary" onClick={() => set("all")}>
          Tout accepter
        </button>
      </div>
    </div>
  );
}
