"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useCart } from "../lib/cart";
import { api } from "../lib/api";
import { parseProduct, type Product } from "../lib/schemas";
import { HERO_COLORS, findHeroColor, useHeroColor } from "../lib/heroColor";
import { StockCounter } from "./StockCounter";
import { trackEvent } from "./Trackers";

const SIZES: { label: string; soldout?: boolean }[] = [
  { label: "S" },
  { label: "M" },
  { label: "L" },
  { label: "XL" },
  { label: "XXL", soldout: true },
];

const FLASK_SLUG = "flasques-500ml";
const FLASK_CART_IMAGE = "/images/flasks/pack-2-flasks.png";
const STORAGE_KEY = "tf_lp_size";

/**
 * CTA hero desktop : sélecteur de taille + bouton Commander.
 * - Mobile (<900px) : caché côté CSS — la LandingStickyBar prend le relais.
 * - Synchro de la taille via localStorage avec LandingStickyBar.
 * - Pas d'upsell ici : on garde le hero épuré. L'upsell flasques apparaît
 *   uniquement depuis la sticky bar mobile et la page produit.
 */
export function HeroSizeCTA() {
  const add = useCart((s) => s.add);
  const openCart = useCart((s) => s.open);
  const colorName = useHeroColor((s) => s.color);
  const setColor = useHeroColor((s) => s.setColor);
  const colorVariant = findHeroColor(colorName);
  const [product, setProduct] = useState<Product | null>(null);
  const [flaskProduct, setFlaskProduct] = useState<Product | null>(null);
  const [size, setSize] = useState<string>("M");
  const [qty, setQty] = useState<number>(1);
  const [flaskQty, setFlaskQty] = useState<number>(1);
  // Tant que l'utilisateur n'a pas touché aux +/- de la modal flasques, on
  // synchronise flaskQty sur la quantité de gilets (1 pack par gilet). Une
  // fois qu'il modifie manuellement, on devient indépendant.
  const [flaskQtyTouched, setFlaskQtyTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const changeQty = (delta: number) => setQty((q) => Math.max(1, Math.min(10, q + delta)));
  const changeFlaskQty = (delta: number) => {
    setFlaskQtyTouched(true);
    setFlaskQty((q) => Math.max(1, Math.min(10, q + delta)));
  };
  // Décoché par défaut : art. L121-17 Code conso interdit le pré-cochage d'une
  // prestation supplémentaire payante. Mirror du comportement /produit.
  const [addonChecked, setAddonChecked] = useState(false);
  // L'upsell flasques n'est pas affiché d'emblée — il apparaît seulement après
  // un premier clic sur Commander. Évite la surcharge visuelle du hero quand
  // l'utilisateur n'a pas encore exprimé l'intention d'acheter.
  const [showFlaskUpsell, setShowFlaskUpsell] = useState(false);
  const pillRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved && SIZES.some((s) => s.label === saved && !s.soldout)) {
        setSize(saved);
      }
    } catch {
      /* localStorage indisponible (mode privé, quota) — on garde M. */
    }
  }, []);

  // Sync flaskQty sur qty tant que l'utilisateur n'a pas touché manuellement
  // aux boutons +/- de la modal flasques.
  useEffect(() => {
    if (!flaskQtyTouched) setFlaskQty(qty);
  }, [qty, flaskQtyTouched]);

  // Fetch produit — même pattern que LandingStickyBar, double fetch assumé
  // (deux composants indépendants, fetch dedupliqué par le navigateur si
  // identique au cycle de vie). Une éventuelle factorisation via SWR/React Query
  // sera l'occasion d'un refacto plus large.
  useEffect(() => {
    let cancelled = false;
    let attempt = 0;
    const tryFetch = () => {
      api("/products/gilet-trailflow", { parse: parseProduct })
        .then((p) => {
          if (!cancelled) setProduct(p);
        })
        .catch(() => {
          attempt += 1;
          if (attempt < 3 && !cancelled) {
            setTimeout(tryFetch, 1000 * Math.pow(2, attempt - 1));
          }
        });
    };
    tryFetch();
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch flasques — échec silencieux : si le backend ne renvoie pas le pack,
  // la card upsell est masquée et l'utilisateur achète juste le gilet.
  useEffect(() => {
    let cancelled = false;
    api(`/products/${FLASK_SLUG}`, { parse: parseProduct })
      .then((p) => {
        if (!cancelled) setFlaskProduct(p);
      })
      .catch(() => {
        /* silencieux */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handlePickSize = (label: string) => {
    setSize(label);
    try {
      window.localStorage.setItem(STORAGE_KEY, label);
    } catch {
      /* idem mount */
    }
  };

  const handlePillKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    const key = e.key;
    const isNext = key === "ArrowRight" || key === "ArrowDown";
    const isPrev = key === "ArrowLeft" || key === "ArrowUp";
    const isHome = key === "Home";
    const isEnd = key === "End";
    if (!isNext && !isPrev && !isHome && !isEnd) return;

    e.preventDefault();
    const n = SIZES.length;
    const enabled = (i: number) => !SIZES[i].soldout;

    let target = currentIndex;
    if (isHome) {
      target = SIZES.findIndex((s) => !s.soldout);
    } else if (isEnd) {
      for (let i = n - 1; i >= 0; i--) {
        if (enabled(i)) {
          target = i;
          break;
        }
      }
    } else {
      const step = isNext ? 1 : -1;
      for (let i = 1; i <= n; i++) {
        const candidate = ((currentIndex + step * i) % n + n) % n;
        if (enabled(candidate)) {
          target = candidate;
          break;
        }
      }
    }

    if (target < 0 || target === currentIndex) return;
    const targetLabel = SIZES[target].label;
    handlePickSize(targetLabel);
    pillRefs.current[target]?.focus();
  };

  const handleOrder = () => {
    if (!product || submitting) return;
    // Étape 1 : si on a un flaskProduct et qu'on n'a pas encore présenté
    // l'upsell, on le révèle et on attend un second clic pour valider.
    if (flaskProduct && !showFlaskUpsell) {
      setShowFlaskUpsell(true);
      return;
    }
    setSubmitting(true);

    add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      size,
      color: colorVariant.name,
      price: product.price,
      quantity: qty,
      image: colorVariant.cartImage,
    });

    trackEvent("AddToCart", {
      content_name: product.name,
      content_ids: product.id,
      content_type: "product",
      value: product.price * qty,
      currency: "EUR",
      num_items: qty,
      contents: JSON.stringify([
        { id: product.id, quantity: qty, item_price: product.price },
      ]),
      size,
      color: colorVariant.name,
      source: "lp_hero",
    });

    // Upsell : par défaut un pack flasques par gilet, mais l'utilisateur peut
    // l'ajuster via les +/- de la modal (flaskQty est alors indépendant).
    if (addonChecked && flaskProduct) {
      add({
        productId: flaskProduct.id,
        slug: flaskProduct.slug,
        name: flaskProduct.name,
        size: "",
        color: "",
        price: flaskProduct.price,
        quantity: flaskQty,
        image: FLASK_CART_IMAGE,
      });
      trackEvent("AddToCart", {
        content_name: flaskProduct.name,
        content_ids: flaskProduct.id,
        content_type: "product",
        value: flaskProduct.price * flaskQty,
        currency: "EUR",
        num_items: flaskQty,
        contents: JSON.stringify([
          { id: flaskProduct.id, quantity: flaskQty, item_price: flaskProduct.price },
        ]),
        source: "lp_hero_upsell",
      });
    }

    setShowFlaskUpsell(false);
    setAddonChecked(false);
    setFlaskQtyTouched(false);
    openCart();
    setTimeout(() => setSubmitting(false), 800);
  };

  // Sélecteur de couleur : toujours visible, même quand le produit n'est pas
  // encore chargé (fallback). Permet à l'utilisateur de pré-choisir la
  // couleur pendant le fetch back-end.
  const colorPicker = (
    <div
      className="hero-buy-colors"
      role="radiogroup"
      aria-label="Choix du coloris"
    >
      <div className="hero-buy-color-dots">
        {HERO_COLORS.map((c) => {
          const active = c.name === colorName;
          return (
            <button
              key={c.name}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={c.name}
              title={c.name}
              className={`hero-buy-color-dot${active ? " is-active" : ""}`}
              onClick={() => setColor(c.name)}
            >
              <span
                className="hero-buy-color-swatch"
                style={{ background: c.hex }}
                aria-hidden="true"
              />
            </button>
          );
        })}
      </div>
      <span className="hero-buy-color-label" aria-live="polite">{colorName}</span>
    </div>
  );

  // Si le backend ne répond pas, on dégrade vers l'ancien CTA simple (lien
  // /produit) pour ne pas casser le hero. Le sélecteur de couleur reste
  // visible — l'utilisateur peut quand même indiquer son intention.
  if (!product) {
    return (
      <div className="hero-buy">
        {colorPicker}
        <a href="/produit" className="btn-primary" id="buy">
          Commander maintenant
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </a>
      </div>
    );
  }

  return (
    <div className="hero-buy">
      {colorPicker}

      <div className="hero-buy-sizes">
        <div
          className="hero-buy-pills"
          role="radiogroup"
          aria-label="Choix de la taille"
        >
          {SIZES.map((s, i) => {
            const active = s.label === size;
            const disabled = !!s.soldout;
            return (
              <button
                key={s.label}
                ref={(el) => {
                  pillRefs.current[i] = el;
                }}
                type="button"
                role="radio"
                aria-checked={active}
                aria-disabled={disabled}
                disabled={disabled}
                tabIndex={disabled ? -1 : active ? 0 : -1}
                className={`hero-buy-pill${active ? " is-active" : ""}${disabled ? " is-disabled" : ""}`}
                onClick={() => !disabled && handlePickSize(s.label)}
                onKeyDown={(e) => handlePillKeyDown(e, i)}
              >
                {s.label}
              </button>
            );
          })}
        </div>
        <div className="hero-buy-qty-inline" role="group" aria-label="Quantité">
          <button
            type="button"
            className="hero-buy-qty-mini"
            onClick={() => changeQty(-1)}
            disabled={qty <= 1}
            aria-label="Diminuer la quantité"
          >
            −
          </button>
          <span className="hero-buy-qty-mini-val" aria-live="polite">{qty}</span>
          <button
            type="button"
            className="hero-buy-qty-mini"
            onClick={() => changeQty(1)}
            disabled={qty >= 10}
            aria-label="Augmenter la quantité"
          >
            +
          </button>
        </div>
      </div>


      {flaskProduct && showFlaskUpsell && (
        <label className={`addon${addonChecked ? " is-on" : ""}`}>
          <input
            type="checkbox"
            className="addon-input"
            checked={addonChecked}
            onChange={(e) => setAddonChecked(e.target.checked)}
            aria-label={`Ajouter ${flaskProduct.name} pour ${flaskProduct.price}€`}
          />
          <span className="addon-eyebrow">
            <span>Complément</span>
            <span className="addon-state" aria-live="polite">
              {addonChecked ? "Inclus" : "Optionnel"}
            </span>
          </span>
          <span className="addon-row">
            <span className="addon-frame">
              <Image
                src={FLASK_CART_IMAGE}
                alt=""
                width={80}
                height={80}
                className="addon-img"
                style={{ width: "100%", height: "auto" }}
              />
            </span>
            <span className="addon-text">
              <span className="addon-title">{flaskProduct.name}</span>
              <span className="addon-detail">
                {flaskQty > 1
                  ? `Push-pull · ${flaskQty} packs`
                  : "Push-pull · Glisse dans les poches avant"}
              </span>
            </span>
            <span className="addon-aside">
              <span className="addon-price">
                +&nbsp;{(flaskProduct.price * flaskQty).toFixed(2).replace(".", ",")}&nbsp;€
              </span>
              <span className="addon-toggle" aria-hidden="true">
                <span className="addon-toggle-thumb" />
              </span>
            </span>
          </span>
          {/* Sélecteur quantité dédié aux flasques, indépendant du gilet
              (synchro par défaut, modifiable au clic). Placé en dehors du
              <label> ne marche pas — on doit stopPropagation pour ne pas
              toggle la checkbox du parent à chaque clic +/-. */}
          <span
            className="addon-qty"
            role="group"
            aria-label="Quantité de packs flasques"
            onClick={(e) => e.preventDefault()}
          >
            <button
              type="button"
              className="addon-qty-btn"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                changeFlaskQty(-1);
              }}
              disabled={flaskQty <= 1}
              aria-label="Diminuer la quantité de flasques"
            >
              −
            </button>
            <span className="addon-qty-val" aria-live="polite">{flaskQty}</span>
            <button
              type="button"
              className="addon-qty-btn"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                changeFlaskQty(1);
              }}
              disabled={flaskQty >= 10}
              aria-label="Augmenter la quantité de flasques"
            >
              +
            </button>
          </span>
        </label>
      )}

      <div className="hero-buy-trust-row">
        <div className="hero-buy-ship" aria-hidden="false">
          <span className="hero-buy-ship-dot" />
          Livraison gratuite
        </div>
        <StockCounter variant="hero-inline" />
      </div>

      <button
        type="button"
        className="btn-primary"
        id="buy"
        onClick={handleOrder}
        disabled={submitting}
        aria-label={
          showFlaskUpsell
            ? `Confirmer la commande en ${colorName.toLowerCase()} taille ${size} × ${qty}`
            : `Commander en ${colorName.toLowerCase()} taille ${size} × ${qty}`
        }
      >
        {showFlaskUpsell ? "Confirmer ma commande" : "Commander maintenant"}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </button>
    </div>
  );
}
