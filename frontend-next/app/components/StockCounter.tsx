"use client";

import { useEffect, useState } from "react";

/**
 * Stock pseudo-dynamique : décrémente automatiquement depuis une date d'ancrage.
 * Le but est de matérialiser le "Quantités limitées" du texte par un compteur
 * visible et crédible. Le stock affiché ne sort jamais de [MIN, INITIAL] pour
 * éviter aussi bien le "0 en stock" (rupture perçue) que la valeur trop haute
 * qui casserait l'urgence.
 *
 * Volontairement hardcodé côté front — pas d'endpoint backend. Si on veut un
 * vrai stock plus tard, swap par un fetch sur /api/products/:slug.stock.
 */
const ANCHOR_TS = Date.UTC(2026, 4, 13, 0, 0, 0); // 2026-05-13 00:00 UTC
const STOCK_INITIAL = 47;
const STOCK_MIN = 8;
const HOURS_PER_TICK = 7; // -1 unité toutes les 7h → ~3,4/jour

function computeStock(now: number): number {
  const hoursElapsed = Math.max(0, (now - ANCHOR_TS) / 3_600_000);
  const ticks = Math.floor(hoursElapsed / HOURS_PER_TICK);
  return Math.max(STOCK_MIN, STOCK_INITIAL - ticks);
}

type Variant = "hero" | "hero-inline" | "sticky" | "cta";

export function StockCounter({ variant = "hero" }: { variant?: Variant }) {
  const [stock, setStock] = useState<number | null>(null);

  useEffect(() => {
    setStock(computeStock(Date.now()));
    const t = window.setInterval(() => {
      setStock(computeStock(Date.now()));
    }, 60_000); // recalc chaque minute — suffisant pour franchir un tick à 7h
    return () => window.clearInterval(t);
  }, []);

  // SSR-safe : on rend un placeholder de même structure avant mount.
  if (stock === null) {
    return <span className={`stock-counter stock-counter--${variant}`} aria-hidden="true" />;
  }

  // Variant hero-inline : format court (juste "<n> en stock") pour tenir
  // sur la même ligne que "Livraison gratuite". Les autres variants gardent
  // l'urgence du "Plus que".
  const compact = variant === "hero-inline";

  return (
    <span
      className={`stock-counter stock-counter--${variant}`}
      role="status"
      aria-label={`${stock} pièces en stock`}
    >
      <span className="stock-counter-dot" />
      {compact ? (
        <>
          <strong>{stock}</strong> en stock
        </>
      ) : (
        <>
          Plus que <strong>{stock}</strong> en stock
        </>
      )}
    </span>
  );
}
