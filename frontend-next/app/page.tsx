"use client";

import { useEffect } from "react";
import { FloatingCTA } from "./components/FloatingCTA";
import { CartIcon } from "./components/CartDrawer";
import { SiteFooter } from "./components/SiteFooter";
import { formatDeliveryRange } from "./lib/deliveryDate";

export default function HomePage() {
  // Petit script du proto : ajoute la classe .scrolled à <nav> au scroll
  useEffect(() => {
    const nav = document.getElementById("nav");
    if (!nav) return;
    const onScroll = () => {
      if (window.scrollY > 40) nav.classList.add("scrolled");
      else nav.classList.remove("scrolled");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <nav id="nav">
        <div className="logo">
          Trail<span>Flow</span>
        </div>
        <div className="nav-r">
          <a href="#features" className="nav-link">
            Le produit
          </a>
          <a href="#proof" className="nav-link">
            Avis
          </a>
          <div className="nav-price">
            <s>49,90€</s> 34,90€
          </div>
          <CartIcon />
          <a href="/produit" className="nav-btn">
            Commander
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-media">
          <img src="/images/wom-studio.png" alt="Femme portant le gilet TrailFlow" />
          <div className="hero-media-overlay" />
        </div>
        <div className="hero-content">
          <div className="hero-index">TrailFlow · SS 2026</div>
          <div className="hero-tag">Gilet hydratation · Trail &amp; Running</div>
          <h1 className="hero-h1">
            Cours plus loin.<br />
            <strong>Bois malin.</strong><br />
            <em>Reste léger.</em>
          </h1>
          <p className="hero-body">
            Le gilet technique qui s&apos;oublie sur le corps. Mesh réfléchissant,
            boucles anti-ballottement, poche téléphone — tout ce qu&apos;il faut, rien
            de superflu.
          </p>
          <div className="hero-price-block">
            <span className="price-was">49,90€</span>
            <span className="price-now">34,90€</span>
            <span className="price-badge">− 30%</span>
          </div>
          <a href="/produit" className="btn-primary" id="buy">
            Commander maintenant
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
          <div className="hero-trust">
            <div className="ht-item"><div className="ht-dot" />Paiement sécurisé</div>
            <div className="ht-item" suppressHydrationWarning><div className="ht-dot" />Livraison {formatDeliveryRange()}</div>
            <div className="ht-item"><div className="ht-dot" />Retour gratuit 15j</div>
          </div>
        </div>
      </section>

      {/* STRIP */}
      <div className="strip">
        <div className="strip-track">
          {Array.from({ length: 2 }).flatMap((_, dup) => [
            <div key={`a${dup}`} className="strip-item"><strong>Ultra léger</strong>Mesh réfléchissant</div>,
            <div key={`b${dup}`} className="strip-item"><strong>6 poches</strong>Dont poche téléphone</div>,
            <div key={`c${dup}`} className="strip-item"><strong>Unisexe</strong>Tailles S à XL</div>,
            <div key={`d${dup}`} className="strip-item"><strong>Anti-ballottement</strong>Boucles ajustables</div>,
            <div key={`e${dup}`} className="strip-item"><strong>5 000+ vendus</strong>Note 4.7 / 5</div>,
            <div key={`f${dup}`} className="strip-item"><strong>Retour gratuit</strong>15 jours</div>,
          ])}
        </div>
      </div>

      {/* FEATURES */}
      <section className="features" id="features">
        <div>
          <span className="section-eyebrow">Conception</span>
          <h2 className="section-h2">
            Pensé pour<br />les <em>longues distances</em>
          </h2>
          <div className="feat-list">
            <div className="feat-item">
              <div className="feat-num">01</div>
              <div>
                <div className="feat-name">Mesh réfléchissant 360°</div>
                <div className="feat-desc">
                  Tissu technique en nid d&apos;abeille réfléchissant. Respirant le jour, visible la nuit. Sécurité et performance réunies.
                </div>
              </div>
            </div>
            <div className="feat-item">
              <div className="feat-num">02</div>
              <div>
                <div className="feat-name">Poche téléphone tactile</div>
                <div className="feat-desc">
                  Poche zippée sur le brin d&apos;épaule avec fenêtre tactile. Accès immédiat sans retirer le gilet.
                </div>
              </div>
            </div>
            <div className="feat-item">
              <div className="feat-num">03</div>
              <div>
                <div className="feat-name">Boucles click anti-ballottement</div>
                <div className="feat-desc">
                  Double système d&apos;attache avec boucles tactiques renforcées. Ajustement précis en 3 secondes sur toutes les morphologies.
                </div>
              </div>
            </div>
            <div className="feat-item">
              <div className="feat-num">04</div>
              <div>
                <div className="feat-name">Trail, running, cyclisme</div>
                <div className="feat-desc">
                  Unisexe, tailles S à XL. Idéal marathon, ultra-trail, randonnée, VTT. Un gilet, tous les terrains.
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="feat-right">
          <video
            src="/videos/video-presentation.mp4"
            className="feat-img-main"
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            aria-label="Présentation du gilet TrailFlow en mouvement"
          />
        </div>
      </section>

      {/* GALLERY */}
      <section className="gallery">
        <div className="gallery-header">
          <div>
            <span className="section-eyebrow">Vues produit</span>
            <h2>Chaque détail <em>compte</em></h2>
          </div>
          <p className="gallery-sub">
            Mesh réfléchissant, boucles renforcées, dos aéré — pensé pour durer.
          </p>
        </div>
        {/* Desktop : 2 planches horizontales stackées. Mobile : grille de cellules ci-dessous. */}
        <div className="gallery-mosaic-stack">
          <img
            src="/images/gallery-mosaic-1.png"
            alt="Vues principales du gilet TrailFlow — face, dos, profil"
            className="gallery-mosaic"
          />
          <img
            src="/images/gallery-mosaic-2.png"
            alt="Détails du gilet TrailFlow — bretelle réfléchissante, boucle click"
            className="gallery-mosaic"
          />
        </div>
        <div className="gallery-grid">
          <div className="gi">
            <img src="/images/product-face-sol.png" alt="Face avec flasque" />
            <div className="gi-label">Face · avec flasque</div>
          </div>
          <div className="gi">
            <img src="/images/product-3quart.png" alt="3/4 avant" />
            <div className="gi-label">3/4 avant</div>
          </div>
          <div className="gi">
            <img src="/images/product-cote-droit.png" alt="Côté droit" />
            <div className="gi-label">Côté droit</div>
          </div>
          <div className="gi">
            <img src="/images/product-dos.png" alt="Dos" />
            <div className="gi-label">Dos</div>
          </div>
          <div className="gi">
            <img src="/images/product-cote-gauche.png" alt="Côté gauche" />
            <div className="gi-label">Côté gauche</div>
          </div>
          <div className="gi">
            <img src="/images/product-details.png" alt="Détail boucle réfléchissante" />
            <div className="gi-label">Détail · boucle</div>
          </div>
        </div>
      </section>

      {/* PROOF */}
      <section className="proof" id="proof">
        <div className="proof-header">
          <span className="section-eyebrow">Témoignages</span>
          <h2>5 000 coureurs<br /><em>ne se trompent pas</em></h2>
        </div>
        <div className="reviews">
          <div className="review">
            <div className="review-stars">★ ★ ★ ★ ★</div>
            <p className="review-quote">
              « Parfait pour mes sorties trail longue distance. Le gilet ne bouge pas d&apos;un millimètre même sur terrain accidenté. »
            </p>
            <div className="review-meta">Thomas D. — Ultra-traileur · Lyon</div>
          </div>
          <div className="review">
            <div className="review-stars">★ ★ ★ ★ ★</div>
            <p className="review-quote">
              « Le meilleur rapport qualité-prix du marché. Salomon pour le même usage, c&apos;est cinq fois plus cher. »
            </p>
            <div className="review-meta">Sarah M. — Marathonienne · Paris</div>
          </div>
          <div className="review">
            <div className="review-stars">★ ★ ★ ★ ☆</div>
            <p className="review-quote">
              « Ultra léger, on oublie qu&apos;on le porte. Les bandes réfléchissantes sont vraiment efficaces pour mes sorties à l&apos;aube. »
            </p>
            <div className="review-meta">Marc L. — Cycliste · Bordeaux</div>
          </div>
        </div>
        <div className="stats">
          <div className="stat"><span className="stat-n">5K+</span><div className="stat-l">Vendus</div></div>
          <div className="stat"><span className="stat-n">4.7</span><div className="stat-l">Note moyenne</div></div>
          <div className="stat"><span className="stat-n">477</span><div className="stat-l">Avis vérifiés</div></div>
          <div className="stat"><span className="stat-n">15j</span><div className="stat-l">Retour gratuit</div></div>
        </div>
      </section>

      {/* SPLIT */}
      <section className="split">
        <div className="split-header">
          <span className="section-eyebrow">Pour elle &amp; pour lui</span>
          <h2>Un gilet, <em>deux coureurs</em></h2>
        </div>
        <div className="split-grid">
          <div className="split-card">
            <img src="/images/wom-studio.png" alt="Femme TrailFlow — face" className="img-front" />
            <img src="/images/wom-studio-dos.png" alt="Femme TrailFlow — dos" className="img-back" />
            <div className="split-grad" />
            <div className="split-info">
              <div className="split-kicker">Running féminin</div>
              <div className="split-name">TrailFlow Pour Elle</div>
              <div className="split-desc">Legging noir + brassière sport · Réglable S–XL</div>
            </div>
          </div>
          <div className="split-card">
            <img src="/images/man-studio.png" alt="Homme TrailFlow — face" className="img-front" />
            <img src="/images/man-studio-dos.png" alt="Homme TrailFlow — dos" className="img-back" />
            <div className="split-grad" />
            <div className="split-info">
              <div className="split-kicker">Running masculin</div>
              <div className="split-name">TrailFlow Pour Lui</div>
              <div className="split-desc">T-shirt technique + short running · Réglable S–XL</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-kicker">Offre de lancement · Quantités limitées</div>
        <h2 className="cta-h2">
          Prêt à courir<br /><em>plus loin ?</em>
        </h2>
        <p className="cta-sub">
          Livraison rapide · Paiement sécurisé · Retour gratuit 15 jours. Sans question.
        </p>
        <div className="cta-price-block">
          <span className="was">49,90€</span>
          <span className="now">34,90€</span>
          <span className="tag">Livraison offerte</span>
        </div>
        <a href="/produit" className="btn-primary">
          Commander TrailFlow
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </a>
        <div className="cta-guarantees">
          <div className="cta-guarantees-track">
            {Array.from({ length: 2 }).flatMap((_, dup) => [
              <div key={`g1-${dup}`} className="cta-g"><div className="cta-g-dot" />Paiement 100% sécurisé</div>,
              <div key={`g2-${dup}`} className="cta-g"><div className="cta-g-dot" />Retour gratuit 15 jours</div>,
              <div key={`g3-${dup}`} className="cta-g" suppressHydrationWarning><div className="cta-g-dot" />Livraison Colissimo {formatDeliveryRange()}</div>,
              <div key={`g4-${dup}`} className="cta-g"><div className="cta-g-dot" />5 000+ coureurs satisfaits</div>,
            ])}
          </div>
        </div>
      </section>

      <SiteFooter />

      <FloatingCTA />
    </>
  );
}
