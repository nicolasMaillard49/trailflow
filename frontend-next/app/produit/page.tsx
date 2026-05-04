"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useCart } from "../lib/cart";
import { api } from "../lib/api";
import { parseProduct, type Product } from "../lib/schemas";
import { CartIcon } from "../components/CartDrawer";
import { trackEvent } from "../components/Trackers";
import { SiteFooter } from "../components/SiteFooter";
import { showToast } from "../components/Toast";

type ImageEntry = { src: string; alt: string };

type ColorVariant = {
  name: string;
  hex: string;
  /** Image utilisée comme miniature de panier quand l'utilisateur ajoute. */
  cartImage: string;
  /** Galerie principale (carrousel + thumbnails). */
  gallery: ImageEntry[];
  /** Cards "Tu pourrais aussi aimer" — femme + homme. */
  related: { woman: string; man: string };
};

// Mémo : pour ajouter une nouvelle couleur, copier les images dans
// /public/images/<color>/ et ajouter une entrée ci-dessous. Tout le reste de
// la page (carrousel, thumbnails, related cards, cart image) est piloté par
// la couleur sélectionnée — aucun autre code à toucher.
const COLOR_VARIANTS: ColorVariant[] = [
  {
    name: "Gris perle",
    hex: "#C4C2BE",
    cartImage: "/images/product-face.png",
    gallery: [
      { src: "/images/product-face.png", alt: "Face" },
      { src: "/images/wom-man-grey-stud.png", alt: "Porté homme + femme" },
      { src: "/images/product-face-sol.png", alt: "Face flasque" },
      { src: "/images/product-3quart.png", alt: "3/4 avant" },
      { src: "/images/product-dos.png", alt: "Dos" },
      { src: "/images/product-cote-droit.png", alt: "Côté droit" },
      { src: "/images/product-cote-gauche.png", alt: "Côté gauche" },
      { src: "/images/product-details.png", alt: "Détails" },
      { src: "/images/running-wom.png", alt: "Porté en course urbaine" },
      { src: "/images/running-woman.png", alt: "Porté en trail" },
    ],
    related: {
      woman: "/images/wom-studio.png",
      man: "/images/man-studio.png",
    },
  },
  {
    name: "Noir nuit",
    hex: "#1C1C1A",
    cartImage: "/images/black/black-cote.png",
    gallery: [
      { src: "/images/black/p-black-face.png", alt: "Face" },
      { src: "/images/black/wom-and-man-black.png", alt: "Porté homme + femme" },
      { src: "/images/black/p-black-face-sol.png", alt: "Face flasque" },
      { src: "/images/black/p-black-3-4.png", alt: "3/4 avant" },
      { src: "/images/black/black-cote.png", alt: "Côté" },
      { src: "/images/black/p-black-cote.png", alt: "Côté détouré" },
      { src: "/images/black/p-black-details.png", alt: "Détails techniques" },
      { src: "/images/black/p-planche-black-haut.png", alt: "Planche détails — haut" },
      { src: "/images/black/p-planche-black-bas.png", alt: "Planche détails — bas" },
    ],
    related: {
      woman: "/images/black/wom-black-stud.png",
      man: "/images/black/man-black-stud.png",
    },
  },
  {
    name: "Bleu pastel",
    hex: "#A7B9D1",
    cartImage: "/images/blue/p-blue-cote.png",
    gallery: [
      { src: "/images/blue/p-blue-face.png", alt: "Face" },
      { src: "/images/blue/wom-man-blue-stud-3-4.png", alt: "Porté homme + femme — 3/4" },
      { src: "/images/blue/p-blue-cote.png", alt: "Côté détouré" },
      { src: "/images/blue/p-blue-face-sol.png", alt: "Face flasque" },
      { src: "/images/blue/p-blue-dos.png", alt: "Dos" },
    ],
    related: {
      woman: "/images/blue/wom-stud-blue.png",
      man: "/images/blue/man-stud-blue.png",
    },
  },
];

const SIZES: { label: string; soldout?: boolean }[] = [
  { label: "S" },
  { label: "M" },
  { label: "L" },
  { label: "XL" },
  { label: "XXL", soldout: true },
];

type Tab = "desc" | "specs" | "reviews" | "sizes";

export default function ProduitPage() {
  const [active, setActive] = useState(0);
  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState(COLOR_VARIANTS[0].name);
  const [qty, setQty] = useState(1);
  const [wishlist, setWishlist] = useState(false);
  const [tab, setTab] = useState<Tab>("desc");
  const [added, setAdded] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [loadError, setLoadError] = useState(false);
  // Fade-out bref pendant le swap de couleur (carrousel + thumbnails).
  const [colorSwapping, setColorSwapping] = useState(false);
  // Upsell pack 2 flasques 500ml — décoché par défaut (conforme art. L121-17
  // Code conso, pas de pré-cochage de prestation supplémentaire payante).
  const [addonChecked, setAddonChecked] = useState(false);
  const [addonProduct, setAddonProduct] = useState<Product | null>(null);

  const variant = COLOR_VARIANTS.find((c) => c.name === color) ?? COLOR_VARIANTS[0];
  const IMAGES = variant.gallery;

  const addItem = useCart((s) => s.add);

  // Quand la couleur change, on remet le carrousel sur la première image et
  // on déclenche un fade rapide pour signaler le swap. Sans ça, on resterait
  // sur l'index courant qui peut être hors des nouvelles images.
  const handleColorChange = (next: string) => {
    if (next === color) return;
    setColorSwapping(true);
    // Le fade-out dure ~180 ms ; on swappe à la moitié pour que l'utilisateur
    // ne voie jamais de flash entre deux variantes.
    window.setTimeout(() => {
      setColor(next);
      setActive(0);
      // Petit délai supplémentaire pour laisser le rendu stabiliser avant fade-in.
      window.setTimeout(() => setColorSwapping(false), 60);
    }, 120);
  };

  // Nav scroll listener
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

  // Auto-carrousel sur l'image principale (4s par image, pause au hover)
  // Respecte prefers-reduced-motion : pas de rotation auto si l'utilisateur le demande
  useEffect(() => {
    if (isPaused) return;
    if (typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const id = setInterval(() => {
      setActive((i) => (i + 1) % IMAGES.length);
    }, 4000);
    return () => clearInterval(id);
  }, [isPaused, active]);

  // Fetch du produit avec retry exponentiel (3 tentatives)
  useEffect(() => {
    let cancelled = false;
    let attempt = 0;
    const tryFetch = () => {
      api("/products/gilet-trailflow", { parse: parseProduct })
        .then((p) => {
          if (cancelled) return;
          setProduct(p);
          setLoadError(false);
          trackEvent("ViewContent", {
            content_name: p.name,
            content_ids: p.id,
            value: p.price,
            currency: "EUR",
          });
        })
        .catch((e) => {
          if (cancelled) return;
          attempt += 1;
          if (attempt < 3) {
            // backoff: 1s, 2s, 4s
            setTimeout(tryFetch, 1000 * Math.pow(2, attempt - 1));
          } else {
            console.warn("Backend unreachable after 3 retries:", e.message);
            setLoadError(true);
          }
        });
    };
    tryFetch();
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch de l'add-on flasques en parallèle. Échec silencieux : si le produit
  // n'est pas dispo, la card est masquée plutôt que de bloquer la page.
  useEffect(() => {
    let cancelled = false;
    api("/products/flasques-500ml", { parse: parseProduct })
      .then((p) => {
        if (!cancelled) setAddonProduct(p);
      })
      .catch(() => { /* silencieux */ });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleAdd = () => {
    if (!product) return;
    if (!size) {
      // Forcer l'utilisateur à choisir une taille — scroll vers le sélecteur
      const el = document.querySelector(".size-grid");
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      size,
      color,
      price: product.price,
      quantity: qty,
      image: variant.cartImage,
    });
    trackEvent("AddToCart", {
      content_name: product.name,
      content_ids: product.id,
      value: product.price * qty,
      currency: "EUR",
      size,
      color,
    });

    // Upsell : si la case est cochée, on ajoute le pack flasques en ligne
    // distincte (qty 1 fixe, indépendante du qty veste — un coureur qui
    // achète 2 vestes pour son couple n'a pas forcément besoin de 4 flasques).
    const withAddon = addonChecked && addonProduct;
    if (withAddon) {
      addItem({
        productId: addonProduct.id,
        slug: addonProduct.slug,
        name: addonProduct.name,
        size: "",
        color: "",
        price: addonProduct.price,
        quantity: 1,
        image: "/images/flasks/pack-2-flasks.png",
      });
      trackEvent("AddToCart", {
        content_name: addonProduct.name,
        content_ids: addonProduct.id,
        value: addonProduct.price,
        currency: "EUR",
      });
    }

    setAdded(true);
    showToast(
      withAddon
        ? `${product.name} + Pack flasques ajoutés au panier`
        : `${product.name} (${color}, taille ${size}) ajouté au panier`,
    );
    setTimeout(() => setAdded(false), 2000);
  };

  const changeQty = (delta: number) => {
    setQty((q) => Math.max(1, Math.min(10, q + delta)));
  };

  return (
    <>
      <nav id="nav">
        <a href="/" className="logo">
          Trail<span>Flow</span>
        </a>
        <div className="nav-r">
          <a href="#" className="nav-link">
            Collections
          </a>
          <a href="#" className="nav-link">
            Notre histoire
          </a>
          <div className="nav-price">
            <s>49,90€</s> 34,90€
          </div>
          <CartIcon />
          <button className="nav-btn" onClick={handleAdd} disabled={!product}>
            Ajouter au panier
          </button>
        </div>
      </nav>

      {/* BREADCRUMB */}
      <div className="breadcrumb">
        <a href="/" className="bc-item">
          Accueil
        </a>
        <span className="bc-sep">·</span>
        <a href="#" className="bc-item">
          Running
        </a>
        <span className="bc-sep">·</span>
        <span className="bc-item bc-current">Gilet TrailFlow</span>
      </div>

      {/* PRODUCT */}
      <div className="product">
        {/* GALLERY */}
        <div className={`gallery-side${colorSwapping ? " color-swapping" : ""}`}>
          <div
            className="main-img-wrap"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <Image
              key={IMAGES[active].src}
              src={IMAGES[active].src}
              alt={`Gilet TrailFlow ${color} — ${IMAGES[active].alt}`}
              className="main-img"
              width={1200}
              height={1200}
              // L'image principale est above-the-fold → priority pour LCP
              priority
              sizes="(max-width: 900px) 100vw, 50vw"
            />
          </div>
          <div className="thumbnails">
            {IMAGES.map((img, i) => (
              <button
                key={img.src}
                type="button"
                className={`thumb${i === active ? " active" : ""}`}
                onClick={() => setActive(i)}
                aria-label={`Voir ${img.alt}`}
              >
                <Image src={img.src} alt={img.alt} width={120} height={120} />
              </button>
            ))}
          </div>
        </div>

        {/* INFO */}
        <div className="info-side">
          <div className="prod-eyebrow">
            Gilet hydratation · Trail &amp; Running
          </div>

          <h1 className="prod-name">
            TrailFlow<br />
            <em>Hydration Vest</em>
          </h1>
          <p className="prod-tagline">
            Le gilet technique qui s&apos;oublie sur le corps.<br />
            Conçu pour les longues distances, les trails exigeants et les matins à
            l&apos;aube.
          </p>

          <div className="rating-row">
            <span className="stars">★★★★★</span>
            <span className="rating-score">4.7 / 5</span>
            <button
              type="button"
              className="rating-count"
              onClick={() => setTab("reviews")}
            >
              477 avis vérifiés
            </button>
          </div>

          {/* PRICE — lit comparePrice/price depuis l'API si dispo, sinon fallback */}
          <div className="price-block">
            {product?.comparePrice ? (
              <span className="price-was">
                {product.comparePrice.toFixed(2).replace(".", ",")}€
              </span>
            ) : (
              <span className="price-was">49,90€</span>
            )}
            <span className="price-now">
              {product
                ? `${product.price.toFixed(2).replace(".", ",")}€`
                : "34,90€"}
            </span>
            {product?.comparePrice && product.price && (
              <span className="price-badge">
                − {Math.round((1 - product.price / product.comparePrice) * 100)}%
              </span>
            )}
          </div>
          <p className="price-note">Livraison gratuite · Retour sous 15 jours</p>

          {/* COLOR */}
          <div className="option-block">
            <div className="option-label">
              Coloris <span>{color}</span>
            </div>
            <div className="color-grid">
              {COLOR_VARIANTS.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  className={`color-dot${c.name === color ? " active" : ""}`}
                  style={{
                    background: c.hex,
                    border:
                      c.hex === "#1C1C1A"
                        ? "0.5px solid rgba(240,237,232,0.2)"
                        : undefined,
                  }}
                  title={c.name}
                  onClick={() => handleColorChange(c.name)}
                  aria-label={c.name}
                  aria-pressed={c.name === color}
                />
              ))}
            </div>
          </div>

          {/* SIZE */}
          <div className="option-block">
            <div className="option-label">
              Taille <span>{size || "Choisir"}</span>
            </div>
            <div className="size-grid">
              {SIZES.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  className={`size-btn${s.soldout ? " soldout" : ""}${
                    s.label === size ? " active" : ""
                  }`}
                  onClick={() => !s.soldout && setSize(s.label)}
                  disabled={s.soldout}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* UPSELL — Pack 2 flasques 500ml */}
          {addonProduct && (
            <label
              className={`upsell-addon${addonChecked ? " checked" : ""}`}
              data-checked={addonChecked}
            >
              <input
                type="checkbox"
                className="upsell-checkbox"
                checked={addonChecked}
                onChange={(e) => setAddonChecked(e.target.checked)}
                aria-label={`Ajouter ${addonProduct.name} pour ${addonProduct.price}€`}
              />
              <span className="upsell-box" aria-hidden="true">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <Image
                src="/images/flasks/pack-2-flasks.png"
                alt=""
                width={44}
                height={44}
                className="upsell-img"
              />
              <span className="upsell-body">
                <span className="upsell-name">{addonProduct.name}</span>
                <span className="upsell-meta">Compatible TrailFlow · Push-pull</span>
              </span>
              <span className="upsell-price">+{addonProduct.price}€</span>
            </label>
          )}

          {/* QTY + CTA */}
          <div className="qty-cta">
            <div className="qty-wrap">
              <button
                type="button"
                className="qty-btn"
                onClick={() => changeQty(-1)}
                aria-label="Diminuer la quantité"
              >
                −
              </button>
              <input
                className="qty-val"
                value={qty}
                readOnly
                aria-label="Quantité"
              />
              <button
                type="button"
                className="qty-btn"
                onClick={() => changeQty(1)}
                aria-label="Augmenter la quantité"
              >
                +
              </button>
            </div>
            <button
              type="button"
              className={`btn-add${added ? " added" : ""}`}
              onClick={handleAdd}
              disabled={!product}
            >
              {added ? (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Ajouté !
                </>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
                  {product ? "Ajouter au panier" : loadError ? "Backend indisponible" : "Chargement…"}
                </>
              )}
            </button>
            <button
              type="button"
              className={`btn-wishlist${wishlist ? " active" : ""}`}
              onClick={() => setWishlist((w) => !w)}
              title="Favoris"
              aria-label="Ajouter aux favoris"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(240,237,232,0.5)" strokeWidth="1.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </div>

          {/* TRUST */}
          <div className="trust-mini">
            <div className="trust-item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Paiement sécurisé
            </div>
            <div className="trust-item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              Livraison 7–13 mai
            </div>
            <div className="trust-item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              Retour gratuit 15j
            </div>
            <div className="trust-item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              5 000+ coureurs satisfaits
            </div>
          </div>

          {/* TABS */}
          <div className="tabs">
            <div className="tab-nav">
              <button type="button" className={`tab-btn${tab === "desc" ? " active" : ""}`} onClick={() => setTab("desc")}>Description</button>
              <button type="button" className={`tab-btn${tab === "specs" ? " active" : ""}`} onClick={() => setTab("specs")}>Caractéristiques</button>
              <button type="button" className={`tab-btn${tab === "reviews" ? " active" : ""}`} onClick={() => setTab("reviews")}>Avis (477)</button>
              <button type="button" className={`tab-btn${tab === "sizes" ? " active" : ""}`} onClick={() => setTab("sizes")}>Guide des tailles</button>
            </div>

            <div className={`tab-panel${tab === "desc" ? " active" : ""}`}>
              <p className="desc-text">
                Le TrailFlow Hydration Vest est conçu pour les coureurs qui refusent de choisir entre performance et légèreté. Son architecture en mesh réfléchissant en nid d&apos;abeille offre une ventilation maximale tout en garantissant une visibilité 360° lors des sorties nocturnes.
              </p>
              <ul className="desc-list">
                <li>Mesh réfléchissant en nid d&apos;abeille — respirant et visible de nuit</li>
                <li>2 poches avant élastiques pour flasques ou gels énergétiques</li>
                <li>1 poche zippée avant avec fenêtre tactile pour téléphone</li>
                <li>1 poche zippée dos pour les essentiels (clés, carte, argent)</li>
                <li>Double système de boucles click anti-ballottement ajustables</li>
                <li>Bandes réfléchissantes sur les bretelles — sécurité nocturne</li>
                <li>Poignée de transport intégrée dans le col</li>
                <li>Compatible flasques soft flask 500ml (non incluses)</li>
                <li>Unisexe — Tailles S à XL</li>
                <li>Usage : Trail · Running · Marathon · Cyclisme · Randonnée</li>
              </ul>
            </div>

            <div className={`tab-panel${tab === "specs" ? " active" : ""}`}>
              <table className="specs-table">
                <tbody>
                  <tr><td>Matière principale</td><td>Polyester mesh réfléchissant</td></tr>
                  <tr><td>Matière poches</td><td>Nylon ripstop 210D</td></tr>
                  <tr><td>Fermetures</td><td>Boucles click YKK renforcées</td></tr>
                  <tr><td>Zips</td><td>YKK #3 waterproof</td></tr>
                  <tr><td>Tailles disponibles</td><td>S · M · L · XL</td></tr>
                  <tr><td>Coloris</td><td>Gris perle · Noir nuit · Bleu marine</td></tr>
                  <tr><td>Poids (taille M)</td><td>~180g</td></tr>
                  <tr><td>Capacité poche principale</td><td>500ml soft flask (×2)</td></tr>
                  <tr><td>Compatibilité</td><td>Trail · Running · Cyclisme · Rando</td></tr>
                  <tr><td>Genre</td><td>Unisexe</td></tr>
                  <tr><td>Note moyenne</td><td>4.7 / 5 — 477 avis</td></tr>
                  <tr><td>Origine</td><td>Asie · Contrôle qualité Europe</td></tr>
                </tbody>
              </table>
            </div>

            <div className={`tab-panel${tab === "reviews" ? " active" : ""}`}>
              <div className="review-summary">
                <div className="big-score">4.7</div>
                <div className="score-detail">
                  <div className="score-stars">★★★★★</div>
                  <div className="score-count">477 avis vérifiés</div>
                  <div style={{ marginTop: 14 }}>
                    {[
                      { star: 5, pct: 72 },
                      { star: 4, pct: 18 },
                      { star: 3, pct: 6 },
                      { star: 2, pct: 2 },
                      { star: 1, pct: 2 },
                    ].map((r) => (
                      <div key={r.star} className="bar-row">
                        <div className="bar-label">{r.star}</div>
                        <div className="bar-track">
                          <div className="bar-fill" style={{ width: `${r.pct}%` }} />
                        </div>
                        <div className="bar-pct">{r.pct}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="review-list">
                <div className="review-item">
                  <div className="review-header">
                    <div className="review-author">Thomas D.</div>
                    <div className="review-date">14 avril 2026</div>
                  </div>
                  <div className="review-stars-sm">★★★★★</div>
                  <div className="review-title">Parfait pour l&apos;ultra-trail</div>
                  <div className="review-body">
                    « Utilisé sur 3 sorties longues dont un 50km trail montagne. Le gilet ne bouge pas d&apos;un millimètre, même dans les descentes techniques. La poche téléphone est vraiment bien pensée. »
                  </div>
                  <div className="verified">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                    Achat vérifié
                  </div>
                </div>
                <div className="review-item">
                  <div className="review-header">
                    <div className="review-author">Sarah M.</div>
                    <div className="review-date">2 avril 2026</div>
                  </div>
                  <div className="review-stars-sm">★★★★★</div>
                  <div className="review-title">Meilleur rapport qualité-prix</div>
                  <div className="review-body">
                    « J&apos;avais un Salomon avant. Pour une utilisation running classique, TrailFlow fait exactement le même travail pour 5× moins cher. Je l&apos;emmène maintenant sur tous mes marathons. »
                  </div>
                  <div className="verified">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                    Achat vérifié
                  </div>
                </div>
                <div className="review-item">
                  <div className="review-header">
                    <div className="review-author">Marc L.</div>
                    <div className="review-date">21 mars 2026</div>
                  </div>
                  <div className="review-stars-sm">★★★★☆</div>
                  <div className="review-title">Très léger, très respirant</div>
                  <div className="review-body">
                    « Ultra léger, on oublie vraiment qu&apos;on le porte. Les bandes réfléchissantes sont efficaces pour mes sorties à 6h du matin. J&apos;enlève une étoile car les flasques ne sont pas incluses — à préciser. »
                  </div>
                  <div className="verified">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                    Achat vérifié
                  </div>
                </div>
              </div>
            </div>

            <div className={`tab-panel${tab === "sizes" ? " active" : ""}`}>
              <p className="desc-text" style={{ marginBottom: 20 }}>
                Le TrailFlow s&apos;ajuste sur toutes les morphologies grâce aux boucles réglables. En cas de doute, prends la taille au-dessus.
              </p>
              <table className="size-guide-table">
                <thead>
                  <tr>
                    <th>Taille</th>
                    <th>Tour de poitrine</th>
                    <th>Tour de taille</th>
                    <th>Poids indicatif</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>S</td><td>80–88 cm</td><td>65–73 cm</td><td>50–65 kg</td></tr>
                  <tr className={size === "M" ? "highlight" : ""}><td>M</td><td>88–96 cm</td><td>73–81 cm</td><td>65–80 kg</td></tr>
                  <tr><td>L</td><td>96–104 cm</td><td>81–89 cm</td><td>75–90 kg</td></tr>
                  <tr><td>XL</td><td>104–112 cm</td><td>89–97 cm</td><td>85–100 kg</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* DETAILS SECTION */}
      <section className="section section-alt">
        <div className="section-header">
          <span className="eyebrow">Conception</span>
          <h2 className="section-h2">
            Pensé pour <em>chaque détail</em>
          </h2>
        </div>
        <div className="details-grid">
          {[
            { n: "01", t: "Mesh réfléchissant 360°", d: "Tissu technique en nid d'abeille réfléchissant. Respirant le jour, visible la nuit grâce aux bandes rétro-réfléchissantes sur chaque bretelle." },
            { n: "02", t: "Poche téléphone tactile", d: "Poche zippée avec fenêtre tactile transparente sur le brin d'épaule gauche. Accès direct à l'écran sans jamais retirer le gilet." },
            { n: "03", t: "Boucles click anti-ballottement", d: "Double système d'attache avec boucles tactiques YKK renforcées. Ajustement précis en 3 secondes. Zéro mouvement sur les terrains techniques." },
            { n: "04", t: "6 zones de rangement", d: "2 poches élastiques flasques avant, 1 poche zip téléphone, 1 poche zip dos, 2 ports flasque latéraux. Tout à portée sans ouvrir de zip." },
            { n: "05", t: "Dos respirant aéré", d: "Panneau dos en tissu lisse avec zip discret. Surface de contact minimale avec le dos pour réduire la transpiration sur les longues distances." },
            { n: "06", t: "Ultra léger ~180g", d: "Construction minimaliste. Le gilet disparaît sur le corps après quelques minutes. Idéal marathon, ultra-trail, cyclisme, randonnée." },
          ].map((d) => (
            <div key={d.n} className="detail-card">
              <span className="detail-num">{d.n}</span>
              <div className="detail-title">{d.t}</div>
              <div className="detail-desc">{d.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* RELATED */}
      <section className="section">
        <div className="section-header">
          <span className="eyebrow">Complète ton équipement</span>
          <h2 className="section-h2">
            Tu pourrais <em>aussi aimer</em>
          </h2>
        </div>
        <div className="related-grid">
          {/* On affiche les *autres* coloris en cross-sell. Cliquer sur une
              card switche la page sur cette couleur (même carrousel + scroll
              vers le sélecteur), donc l'utilisateur découvre la variante sans
              perdre son contexte. On alterne mannequin femme/homme pour
              casser la monotonie visuelle. */}
          {COLOR_VARIANTS.filter((c) => c.name !== color).map((c, i) => {
            const useWoman = i % 2 === 0;
            const img = useWoman ? c.related.woman : c.related.man;
            const label = useWoman ? "Running féminin" : "Running masculin";
            return (
              <button
                key={c.name}
                type="button"
                className={`related-card${colorSwapping ? " color-swapping" : ""}`}
                onClick={() => {
                  handleColorChange(c.name);
                  // Scroll vers le haut produit pour montrer le swap d'images.
                  if (typeof window !== "undefined") {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                }}
                aria-label={`Voir le coloris ${c.name}`}
              >
                <div className="related-img">
                  <Image
                    key={img}
                    src={img}
                    alt={`TrailFlow ${c.name}`}
                    width={600}
                    height={600}
                    sizes="(max-width: 900px) 100vw, 33vw"
                  />
                </div>
                <div className="related-info">
                  <div className="related-label">{label}</div>
                  <div className="related-name">TrailFlow — {c.name}</div>
                  <div className="related-price">
                    <span className="was">49,90€</span>
                    <span className="now">34,90€</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <SiteFooter />

      {/* STICKY MOBILE */}
      <div className="sticky-cta" id="stickyCta">
        <div className="sticky-info">
          <div className="sticky-name">TrailFlow Hydration Vest</div>
          <div className="sticky-price">
            <s style={{ color: "var(--muted)", fontSize: 12 }}>49,90€</s> 34,90€
          </div>
        </div>
        <button className="nav-btn" onClick={handleAdd} disabled={!product}>
          Ajouter au panier
        </button>
      </div>
    </>
  );
}
