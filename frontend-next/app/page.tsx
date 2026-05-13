"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { FloatingCTA } from "./components/FloatingCTA";
import { CartIcon } from "./components/CartDrawer";
import { SiteFooter } from "./components/SiteFooter";
import { LandingStickyBar } from "./components/LandingStickyBar";
import { HeroSizeCTA } from "./components/HeroSizeCTA";
import { StockCounter } from "./components/StockCounter";
import { ComparisonTable } from "./components/ComparisonTable";
import { LazyVideo } from "./components/LazyVideo";
import { formatDeliveryRange } from "./lib/deliveryDate";

import heroWoman from "@/public/images/wom-studio.png";
import galleryMosaic1 from "@/public/images/gallery-mosaic-1.png";
import galleryMosaic2 from "@/public/images/gallery-mosaic-2.png";
import productFaceSol from "@/public/images/product-face-sol.png";
import product3Quart from "@/public/images/product-3quart.png";
import productCoteDroit from "@/public/images/product-cote-droit.png";
import productDos from "@/public/images/product-dos.png";
import productCoteGauche from "@/public/images/product-cote-gauche.png";
import productDetails from "@/public/images/product-details.png";
import womStudio from "@/public/images/wom-studio.png";
import womStudioDos from "@/public/images/wom-studio-dos.png";
import manStudio from "@/public/images/man-studio.png";
import manStudioDos from "@/public/images/man-studio-dos.png";

// Source de vérité des avis affichés sur la LP. Hors composant pour éviter
// la recréation à chaque rendu — la liste est statique.
const REVIEWS = [
  { photo: "/images/reviews/review-1.avif", stars: "★ ★ ★ ★ ★", quote: "Parfait pour mes sorties longue distance. Le gilet ne bouge pas d'un millimètre même sur terrain accidenté.", name: "T. Dubois", meta: "Mars 2026 · Ultra-trail · Lyon" },
  { photo: "/images/reviews/review-2.avif", stars: "★ ★ ★ ★ ★", quote: "Le meilleur rapport qualité-prix du marché. Salomon pour le même usage, c'est cinq fois plus cher.", name: "C. Martin", meta: "Avril 2026 · Marathon · Paris" },
  { photo: "/images/reviews/review-3.avif", stars: "★ ★ ★ ★ ☆", quote: "Ultra léger, on oublie qu'on le porte. Les bandes réfléchissantes sont vraiment efficaces pour les sorties à l'aube.", name: "M. Laurent", meta: "Avril 2026 · Vélo route · Bordeaux" },
  { photo: "/images/reviews/review-4.avif", stars: "★ ★ ★ ★ ★", quote: "Acheté pour un trail de 30 km. Zéro frottement, zéro mouvement parasite. Les flasques tiennent en place en descente technique.", name: "Camille B.", meta: "Mai 2026 · Trail · Annecy" },
  { photo: "/images/reviews/review-5.avif", stars: "★ ★ ★ ★ ★", quote: "Habitué des sorties longues, je cherchais un gilet sans gadgets. Celui-ci coche tout : poches accessibles, ajustement précis, séchage rapide.", name: "Alexis T.", meta: "Mai 2026 · Course longue · Toulouse" },
  { photo: "/images/reviews/review-6.avif", stars: "★ ★ ★ ★ ★", quote: "Le rapport qualité-prix est imbattable. J'avais des doutes au déballage mais après 200 km les coutures tiennent.", name: "Dominique L.", meta: "Avril 2026 · Course nature · Nantes" },
  { photo: "/images/reviews/review-7.avif", stars: "★ ★ ★ ★ ★", quote: "Testé en altitude sur deux week-ends. Capacité de rangement nickel, accès rapide aux barres énergétiques sans s'arrêter.", name: "Sasha M.", meta: "Mars 2026 · Trail · Grenoble" },
  { photo: "/images/reviews/review-8.avif", stars: "★ ★ ★ ★ ★", quote: "Léger, ajustable, accessible. Trois critères atteints. Le quatrième c'est le prix, et il est imbattable.", name: "Charlie R.", meta: "Février 2026 · Ultra-trail · Chambéry" },
  { photo: "/images/reviews/review-9.avif", stars: "★ ★ ★ ★ ★", quote: "Très satisfait après six semaines d'utilisation intensive. Les boucles ne se desserrent pas, les coutures tiennent.", name: "Morgan B.", meta: "Février 2026 · Course matinale · Strasbourg" },
  { photo: "/images/reviews/review-10.avif", stars: "★ ★ ★ ★ ★", quote: "La poche téléphone tactile change la vie en sortie longue. Plus besoin d'enlever le gilet pour répondre à un message.", name: "Sam V.", meta: "Mars 2026 · Trail technique · Aix-en-Provence" },
  { photo: "/images/reviews/review-11.avif", stars: "★ ★ ★ ★ ★", quote: "Acheté un peu sceptique au vu du prix mais largement à la hauteur. L'aération dorsale tient même en été.", name: "Robin S.", meta: "Janvier 2026 · Marathon · Marseille" },
  { photo: "/images/reviews/review-12.avif", stars: "★ ★ ★ ★ ★", quote: "Testé sur un marathon, puis sur des sorties trail jusqu'à 40 km. Aucun signe de fatigue du matériel.", name: "Eden P.", meta: "Mars 2026 · Course longue · Rennes" },
  { photo: "/images/reviews/review-13.avif", stars: "★ ★ ★ ★ ★", quote: "Six poches utiles, pas une de trop. Tout est pensé pour l'accessibilité en mouvement.", name: "Lou C.", meta: "Avril 2026 · Trail nature · Briançon" },
  { photo: "/images/reviews/review-14.avif", stars: "★ ★ ★ ★ ★", quote: "Confortable, sec, stable. Trois mots qui résument ce gilet. Et zéro irritation après quatre heures de course.", name: "Andréa V.", meta: "Janvier 2026 · Trail · Pau" },
  { photo: "/images/reviews/review-15.avif", stars: "★ ★ ★ ★ ☆", quote: "Le système anti-ballottement est sérieux. Comparé à mon ancien gilet, je gagne en concentration sur la foulée.", name: "Maël G.", meta: "Février 2026 · Course longue · La Rochelle" },
  { photo: "/images/reviews/review-16.avif", stars: "★ ★ ★ ★ ★", quote: "Idéal pour les sorties autour de deux heures. J'y mets gel, téléphone, clés, et tout reste en place.", name: "P. Lefèvre", meta: "Décembre 2025 · Trail · Montpellier" },
  { photo: "/images/reviews/review-17.avif", stars: "★ ★ ★ ★ ★", quote: "Bonne surprise : on dirait un produit à 80 €. Coutures propres, élastiques de qualité, finitions soignées.", name: "K. Bertrand", meta: "Décembre 2025 · Vélo gravel · Tours" },
  { photo: "/images/reviews/review-18.avif", stars: "★ ★ ★ ★ ★", quote: "Compatible avec mes flasques 500 ml sans bricolage. Ajustement millimétré sur le buste, ça se sent au premier kilomètre.", name: "J. Roussel", meta: "Mars 2026 · Trail des Cévennes · Nîmes" },
  { photo: "/images/reviews/review-19.avif", stars: "★ ★ ★ ★ ★", quote: "Pour 35 €, je ne pensais pas avoir ce niveau de tenue sur du long. Bien joué.", name: "N. Tessier", meta: "Janvier 2026 · Ultra-trail · Bayonne" },
  { photo: "/images/reviews/review-20.avif", stars: "★ ★ ★ ★ ★", quote: "Boucle de 25 km avec dénivelé : le gilet est resté collé au corps, aucun saut, aucun frottement.", name: "F. Renard", meta: "Décembre 2025 · Trail urbain · Lille" },
  { photo: "/images/reviews/review-21.avif", stars: "★ ★ ★ ★ ★", quote: "La poche dorsale zippée est plus profonde qu'il n'y paraît. J'y range veste légère et buff sans tirer sur les bretelles.", name: "Yael M.", meta: "Avril 2026 · Course longue · Caen" },
  { photo: "/images/reviews/review-22.avif", stars: "★ ★ ★ ★ ★", quote: "Rapport poids/capacité excellent. Je le préfère à mon précédent gilet qui était deux fois plus cher.", name: "Noa T.", meta: "Mai 2026 · Trail · Dijon" },
];
const REVIEWS_INITIAL = 5;

export default function HomePage() {
  // Pagination des avis : on affiche les 5 premiers et on déploie le reste
  // au clic. État local, pas de back-end, conservé en mémoire de session.
  const [reviewsExpanded, setReviewsExpanded] = useState(false);
  const visibleReviews = useMemo(
    () => (reviewsExpanded ? REVIEWS : REVIEWS.slice(0, REVIEWS_INITIAL)),
    [reviewsExpanded],
  );

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
          <Image
            src={heroWoman}
            alt="Femme portant le gilet TrailFlow"
            fill
            priority
            sizes="(max-width: 900px) 100vw, 60vw"
            placeholder="blur"
            style={{ objectFit: "cover", objectPosition: "top center" }}
          />
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
          <HeroSizeCTA />
          <StockCounter variant="hero" />
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
          <LazyVideo
            src="/videos/video-presentation.mp4"
            className="feat-img-main"
            ariaLabel="Présentation du gilet TrailFlow en mouvement"
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
          <Image
            src={galleryMosaic1}
            alt="Vues principales du gilet TrailFlow — face, dos, profil"
            className="gallery-mosaic"
            sizes="(max-width: 900px) 100vw, 90vw"
            placeholder="blur"
          />
          <Image
            src={galleryMosaic2}
            alt="Détails du gilet TrailFlow — bretelle réfléchissante, boucle click"
            className="gallery-mosaic"
            sizes="(max-width: 900px) 100vw, 90vw"
            placeholder="blur"
          />
        </div>
        <div className="gallery-grid">
          <div className="gi">
            <Image src={productFaceSol} alt="Face avec flasque" sizes="(max-width: 900px) 50vw, 33vw" placeholder="blur" />
            <div className="gi-label">Face · avec flasque</div>
          </div>
          <div className="gi">
            <Image src={product3Quart} alt="3/4 avant" sizes="(max-width: 900px) 50vw, 33vw" placeholder="blur" />
            <div className="gi-label">3/4 avant</div>
          </div>
          <div className="gi">
            <Image src={productCoteDroit} alt="Côté droit" sizes="(max-width: 900px) 50vw, 33vw" placeholder="blur" />
            <div className="gi-label">Côté droit</div>
          </div>
          <div className="gi">
            <Image src={productDos} alt="Dos" sizes="(max-width: 900px) 50vw, 33vw" placeholder="blur" />
            <div className="gi-label">Dos</div>
          </div>
          <div className="gi">
            <Image src={productCoteGauche} alt="Côté gauche" sizes="(max-width: 900px) 50vw, 33vw" placeholder="blur" />
            <div className="gi-label">Côté gauche</div>
          </div>
          <div className="gi">
            <Image src={productDetails} alt="Détail boucle réfléchissante" sizes="(max-width: 900px) 50vw, 33vw" placeholder="blur" />
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
          {visibleReviews.map((r) => (
            <div className="review" key={r.name}>
              <Image
                src={r.photo}
                alt=""
                width={400}
                height={500}
                className="review-photo"
                sizes="(max-width: 900px) 100vw, 33vw"
                loading="lazy"
              />
              <div className="review-body">
                <div className="review-stars">{r.stars}</div>
                <p className="review-quote">« {r.quote} »</p>
                <div className="review-meta">
                  <div className="review-meta-top">
                    <span className="review-name">{r.name}</span>
                    <span className="review-verified" aria-label="Achat vérifié">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Achat vérifié
                    </span>
                  </div>
                  <div className="review-meta-bottom">{r.meta}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {!reviewsExpanded && (
          <button
            type="button"
            className="reviews-more"
            onClick={() => setReviewsExpanded(true)}
            aria-expanded={false}
            aria-controls="reviews-grid"
          >
            Voir plus
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        )}
        <div className="stats">
          <div className="stat"><span className="stat-n">5K+</span><div className="stat-l">Vendus</div></div>
          <div className="stat"><span className="stat-n">4.7</span><div className="stat-l">Note moyenne</div></div>
          <div className="stat"><span className="stat-n">477</span><div className="stat-l">Avis vérifiés</div></div>
          <div className="stat"><span className="stat-n">15j</span><div className="stat-l">Retour gratuit</div></div>
        </div>
      </section>

      {/* COMPARISON */}
      <ComparisonTable />

      {/* SPLIT */}
      <section className="split">
        <div className="split-header">
          <span className="section-eyebrow">Pour elle &amp; pour lui</span>
          <h2>Un gilet, <em>deux coureurs</em></h2>
        </div>
        <div className="split-grid">
          <div className="split-card">
            <Image src={womStudio} alt="Femme TrailFlow — face" className="img-front" sizes="(max-width: 900px) 100vw, 50vw" placeholder="blur" />
            <Image src={womStudioDos} alt="Femme TrailFlow — dos" className="img-back" sizes="(max-width: 900px) 100vw, 50vw" placeholder="blur" />
            <div className="split-grad" />
            <div className="split-info">
              <div className="split-kicker">Running féminin</div>
              <div className="split-name">TrailFlow Pour Elle</div>
              <div className="split-desc">Legging noir + brassière sport · Réglable S–XL</div>
            </div>
          </div>
          <div className="split-card">
            <Image src={manStudio} alt="Homme TrailFlow — face" className="img-front" sizes="(max-width: 900px) 100vw, 50vw" placeholder="blur" />
            <Image src={manStudioDos} alt="Homme TrailFlow — dos" className="img-back" sizes="(max-width: 900px) 100vw, 50vw" placeholder="blur" />
            <div className="split-grad" />
            <div className="split-info">
              <div className="split-kicker">Running masculin</div>
              <div className="split-name">TrailFlow Pour Lui</div>
              <div className="split-desc">T-shirt technique + short running · Réglable S–XL</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq" id="faq">
        <div className="faq-header">
          <span className="section-eyebrow">Questions fréquentes</span>
          <h2>On répond <em>avant que tu ne demandes</em></h2>
        </div>
        <div className="faq-list">
          <details className="faq-item">
            <summary>
              <span>Les flasques sont-elles incluses ?</span>
              <span className="faq-icon" aria-hidden="true">+</span>
            </summary>
            <p>
              Non, les flasques souples 500 ml sont en option à 7,90 € le pack de 2.
              Elles s&apos;intègrent dans les poches avant du gilet et peuvent être
              ajoutées au moment de la commande.
            </p>
          </details>
          <details className="faq-item">
            <summary>
              <span>D&apos;où le gilet est-il expédié ?</span>
              <span className="faq-icon" aria-hidden="true">+</span>
            </summary>
            <p>
              Les commandes sont préparées par notre partenaire logistique et expédiées
              en Colissimo avec numéro de suivi. Tu reçois un email de tracking dès le
              départ du colis.
            </p>
          </details>
          <details className="faq-item">
            <summary>
              <span>Quel est le délai de livraison ?</span>
              <span className="faq-icon" aria-hidden="true">+</span>
            </summary>
            <p>
              5 à 8 jours ouvrés en France métropolitaine. La date estimée précise
              s&apos;affiche au moment de la commande, recalculée selon le jour où tu
              passes commande.
            </p>
          </details>
          <details className="faq-item">
            <summary>
              <span>Comment choisir ma taille ?</span>
              <span className="faq-icon" aria-hidden="true">+</span>
            </summary>
            <p>
              Le gilet est unisexe et ajusté — prends ta taille habituelle de t-shirt
              running. Guide indicatif (tour de poitrine) : S 84–92 cm · M 92–100 cm ·
              L 100–108 cm · XL 108–116 cm. En cas de doute, retour gratuit sous 15
              jours.
            </p>
          </details>
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
        <StockCounter variant="cta" />
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
      <LandingStickyBar />
    </>
  );
}
