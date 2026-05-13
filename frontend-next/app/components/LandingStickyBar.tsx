"use client";

import { useEffect, useRef, useState } from "react";
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

// Doit rester aligné avec COLOR_VARIANTS[0] dans app/produit/page.tsx.
const DEFAULT_COLOR = "Gris perle";
const DEFAULT_IMAGE = "/images/product-face.png";

const formatEur = (n: number) => `${n.toFixed(2).replace(".", ",")}€`;
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
  const pillRefs = useRef<(HTMLButtonElement | null)[]>([]);

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

  // Pattern W3C radiogroup : flèches pour naviguer, Home/End pour bornes.
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
    // Filet de sécurité : si l'user fait "retour" et atterrit à nouveau sur la LP,
    // le bouton doit redevenir actif. router.push ne renvoie pas de promesse
    // fiable selon les versions de Next, donc on libère après un court délai.
    setTimeout(() => setSubmitting(false), 1500);
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
                className={`lp-sticky-pill${active ? " is-active" : ""}${disabled ? " is-disabled" : ""}`}
                onClick={() => !disabled && handlePickSize(s.label)}
                onKeyDown={(e) => handlePillKeyDown(e, i)}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="lp-sticky-row lp-sticky-row--cta">
        <div className="lp-sticky-price">
          {product.comparePrice !== null && (
            <>
              <s>{formatEur(product.comparePrice)}</s>{" "}
            </>
          )}
          <strong>{formatEur(product.price)}</strong>
        </div>
        <button
          type="button"
          className="lp-sticky-btn"
          onClick={handleOrder}
          disabled={submitting}
          aria-label={`Commander en taille ${size}, ${formatEur(product.price).replace("€", " euros")}`}
        >
          Commander →
        </button>
      </div>
    </div>
  );
}
