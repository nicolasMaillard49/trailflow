"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../lib/cart";
import { api } from "../lib/api";
import { parseProduct, type Product } from "../lib/schemas";
import { trackEvent } from "./Trackers";

const SIZES: { label: string; soldout?: boolean }[] = [
  { label: "S" },
  { label: "M" },
  { label: "L" },
  { label: "XL" },
  { label: "XXL", soldout: true },
];

const DEFAULT_COLOR = "Gris perle";
const DEFAULT_IMAGE = "/images/product-face.png";
const STORAGE_KEY = "tf_lp_size";

/**
 * Sticky bar mobile sur la LP : sélecteur de taille + CTA express.
 * Visible uniquement <900px (cf. globals.css), apparaît après 15% de scroll,
 * se cache quand la .cta-section finale entre dans le viewport.
 */
export function LandingStickyBar() {
  const router = useRouter();
  const add = useCart((s) => s.add);
  const cartOpen = useCart((s) => s.isOpen);
  const [product, setProduct] = useState<Product | null>(null);
  const [size, setSize] = useState<string>("M");
  const [visible, setVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Rehydrate la taille depuis localStorage après le mount (évite mismatch SSR).
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

  // Fetch produit — mirror exact du pattern utilisé dans /produit.
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
          /* Échec après 3 tentatives : on n'affiche pas la sticky bar. */
        });
    };
    tryFetch();
    return () => {
      cancelled = true;
    };
  }, []);

  // Visibilité scroll-based (mirror FloatingCTA), seuil 15%.
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const total = h.scrollHeight - h.clientHeight;
      if (total <= 0) return setVisible(false);
      const progress = h.scrollTop / total;

      // Hide si la CTA-section finale est dans le viewport (CTA déjà visible).
      const cta = document.querySelector(".cta-section");
      if (cta) {
        const rect = cta.getBoundingClientRect();
        if (rect.top < window.innerHeight) return setVisible(false);
      }

      setVisible(progress > 0.15);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
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

  const handleOrder = () => {
    if (!product || submitting) return;
    setSubmitting(true);

    add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      size,
      color: DEFAULT_COLOR,
      price: product.price,
      quantity: 1,
      image: DEFAULT_IMAGE,
    });

    trackEvent("AddToCart", {
      content_name: product.name,
      content_ids: product.id,
      content_type: "product",
      value: product.price,
      currency: "EUR",
      num_items: 1,
      contents: JSON.stringify([
        { id: product.id, quantity: 1, item_price: product.price },
      ]),
      size,
      color: DEFAULT_COLOR,
      source: "lp_sticky",
    });

    router.push("/checkout");
  };

  // Pas de produit chargé ou cart drawer ouvert → on ne rend rien.
  if (!product) return null;
  if (cartOpen) return null;

  return (
    <div
      className={`lp-sticky-bar${visible ? " is-visible" : ""}`}
      aria-hidden={!visible}
    >
      <div className="lp-sticky-row lp-sticky-row--sizes" role="radiogroup" aria-label="Choix de la taille">
        <span className="lp-sticky-label">Taille</span>
        <div className="lp-sticky-sizes">
          {SIZES.map((s) => {
            const active = s.label === size;
            const disabled = !!s.soldout;
            return (
              <button
                key={s.label}
                type="button"
                role="radio"
                aria-checked={active}
                aria-disabled={disabled}
                disabled={disabled}
                tabIndex={disabled ? -1 : 0}
                className={`lp-sticky-pill${active ? " is-active" : ""}${disabled ? " is-disabled" : ""}`}
                onClick={() => !disabled && handlePickSize(s.label)}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="lp-sticky-row lp-sticky-row--cta">
        <div className="lp-sticky-price">
          <s>49,90€</s> <strong>34,90€</strong>
        </div>
        <button
          type="button"
          className="lp-sticky-btn"
          onClick={handleOrder}
          disabled={submitting}
          aria-label={`Commander en taille ${size}, 34,90 euros`}
        >
          Commander →
        </button>
      </div>
    </div>
  );
}
