"use client";

import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "tf_welcome_seen";
const PROMO_CODE = "BIENVENU5";
const DISPLAY_DELAY_MS = 1500;

/**
 * Popup d'accueil affichée une fois par visiteur : code promo -5% sur la
 * première commande. Stocke un flag en localStorage pour ne plus l'afficher
 * (les utilisateurs qui veulent revoir l'offre peuvent vider leur cache).
 *
 * Pourquoi pas un cookie : pas besoin de la lire côté serveur, donc on évite
 * une dépendance back-end et un round-trip réseau.
 */
export function WelcomePopup() {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(STORAGE_KEY) === "1") return;
    } catch {
      /* localStorage indisponible — on affiche quand même la popup. */
    }
    const t = window.setTimeout(() => setVisible(true), DISPLAY_DELAY_MS);
    return () => window.clearTimeout(t);
  }, []);

  // Focus initial sur le bouton fermer + Escape pour fermer.
  useEffect(() => {
    if (!visible) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const handleClose = () => {
    setVisible(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* idem : on accepte qu'elle réapparaisse si localStorage KO. */
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(PROMO_CODE);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* navigateurs sans clipboard API (rare) — silencieux. */
    }
  };

  if (!visible) return null;

  return (
    <div
      className="welcome-popup-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-popup-title"
      onClick={handleClose}
    >
      <div className="welcome-popup" onClick={(e) => e.stopPropagation()}>
        <button
          ref={closeRef}
          type="button"
          className="welcome-popup-close"
          onClick={handleClose}
          aria-label="Fermer la popup"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="18" y1="6" x2="6" y2="18" />
          </svg>
        </button>
        <div className="welcome-popup-eyebrow">Bienvenue chez TrailFlow</div>
        <h2 id="welcome-popup-title" className="welcome-popup-title">
          −5% sur votre<br /><em>première commande</em>
        </h2>
        <p className="welcome-popup-body">
          Pour fêter votre arrivée, profitez d&apos;une remise immédiate au paiement
          avec le code ci-dessous.
        </p>
        <div className="welcome-popup-code-row">
          <span className="welcome-popup-code" aria-label="Code promo">
            {PROMO_CODE}
          </span>
          <button
            type="button"
            className="welcome-popup-copy"
            onClick={handleCopy}
            aria-live="polite"
          >
            {copied ? "Copié ✓" : "Copier"}
          </button>
        </div>
        <button
          type="button"
          className="welcome-popup-cta"
          onClick={handleClose}
        >
          Commencer mon shopping
        </button>
      </div>
    </div>
  );
}
