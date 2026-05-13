"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  src: string;
  className?: string;
  ariaLabel?: string;
  /** Marge avant l'entrée dans le viewport pour précharger. Plus haut = vidéo
   *  prête plus tôt mais coûte plus en data. 400px ≈ ~1 écran d'avance. */
  rootMargin?: string;
};

/**
 * Vidéo en autoplay qui ne télécharge la source qu'au moment où elle entre
 * (ou s'approche) du viewport. Lighthouse mobile remontait un payload de
 * 6.4 MB systématiquement chargé pour cette vidéo même quand le user scrolle
 * pas jusqu'à la section features — avec ce composant, zéro byte vidéo tant
 * qu'on n'a pas approché l'élément.
 */
export function LazyVideo({ src, className, ariaLabel, rootMargin = "400px" }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    // Si le navigateur ne supporte pas IO (très ancien), on dégrade en
    // chargement immédiat — meilleur compromis qu'une vidéo qui ne joue jamais.
    if (typeof IntersectionObserver === "undefined") {
      setActive(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <video
      ref={videoRef}
      src={active ? src : undefined}
      className={className}
      autoPlay
      loop
      muted
      playsInline
      preload="none"
      aria-label={ariaLabel}
    />
  );
}
