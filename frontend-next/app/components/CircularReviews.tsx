"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

type Review = {
  photo: string;
  stars: string;
  quote: string;
  name: string;
  meta: string;
};

const AUTOPLAY_MS = 6000;

// Seuil de déclenchement du swipe horizontal (px). Sous ce delta on considère
// le geste comme un tap involontaire et on ignore.
const SWIPE_THRESHOLD = 40;

export function CircularReviews({ reviews }: { reviews: Review[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  // Affiché tant que l'utilisateur n'a pas swipé une fois — disparaît dès la
  // première interaction tactile (swipe ou tap) pour ne pas polluer le hero
  // une fois le geste compris.
  const [hintVisible, setHintVisible] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const len = reviews.length;

  const handleNext = useCallback(() => {
    setActive((p) => (p + 1) % len);
  }, [len]);

  const handlePrev = useCallback(() => {
    setActive((p) => (p - 1 + len) % len);
  }, [len]);

  useEffect(() => {
    if (paused || len <= 1) return;
    const id = window.setInterval(() => {
      setActive((p) => (p + 1) % len);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [paused, len]);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      else if (e.key === "ArrowRight") handleNext();
    };
    node.addEventListener("keydown", onKey);
    return () => node.removeEventListener("keydown", onKey);
  }, [handlePrev, handleNext]);

  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0].clientX;
    // Pause l'autoplay pendant le geste — repris au touchend.
    setPaused(true);
  };

  const onTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    const startX = touchStartX.current;
    touchStartX.current = null;
    setPaused(false);
    if (startX == null) return;
    const endX = e.changedTouches[0].clientX;
    const delta = endX - startX;
    if (Math.abs(delta) < SWIPE_THRESHOLD) return;
    if (hintVisible) setHintVisible(false);
    // Swipe vers la droite (doigt de gauche à droite) → avis suivant —
    // calé sur le sens de la flèche affichée dans l'indicateur "swipe →".
    if (delta > 0) handleNext();
    else handlePrev();
  };

  // On rend uniquement les 3 photos pertinentes (active, left, right) pour
  // éviter de monter 22 <Image> en DOM. Next/Image lazy-load le reste mais
  // chaque <Image> reste un node React coûteux à diff sur chaque transition.
  const positions = [
    { index: active, pos: "active" as const },
    { index: (active - 1 + len) % len, pos: "left" as const },
    { index: (active + 1) % len, pos: "right" as const },
  ];

  const current = reviews[active];

  return (
    <div
      ref={rootRef}
      className="circ-rev"
      tabIndex={0}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      role="region"
      aria-roledescription="carousel"
      aria-label="Avis clients"
    >
      <div className="circ-rev-grid">
        <div className="circ-rev-photos" aria-hidden="true">
          {positions.map(({ index, pos }) => {
            const r = reviews[index];
            return (
              <div
                key={`${pos}-${index}`}
                className={`circ-rev-photo circ-rev-photo--${pos}`}
              >
                <Image
                  src={r.photo}
                  alt=""
                  width={500}
                  height={620}
                  sizes="(max-width: 900px) 80vw, 480px"
                  priority={pos === "active" && index === 0}
                  loading={pos === "active" && index === 0 ? "eager" : "lazy"}
                />
              </div>
            );
          })}
        </div>

        <div className="circ-rev-body">
          <div key={active} className="circ-rev-text">
            <div className="circ-rev-stars" aria-label="Note 5 sur 5">
              {current.stars}
            </div>
            <blockquote className="circ-rev-quote">
              {current.quote.split(" ").map((word, i) => (
                <span
                  key={i}
                  className="circ-rev-word"
                  style={{ animationDelay: `${0.025 * i}s` }}
                >
                  {word}&nbsp;
                </span>
              ))}
            </blockquote>
            <div className="circ-rev-meta">
              <span className="circ-rev-name">{current.name}</span>
              <span className="circ-rev-verified" aria-label="Achat vérifié">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Achat vérifié
              </span>
            </div>
            <div className="circ-rev-detail">{current.meta}</div>
          </div>
        </div>
      </div>
      {hintVisible && (
        <div className="circ-rev-swipe-hint" aria-hidden="true">
          <span>swipe</span>
          <svg width="22" height="10" viewBox="0 0 22 10" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
            <line x1="1" y1="5" x2="20" y2="5" />
            <polyline points="15 1 20 5 15 9" />
          </svg>
        </div>
      )}
    </div>
  );
}
