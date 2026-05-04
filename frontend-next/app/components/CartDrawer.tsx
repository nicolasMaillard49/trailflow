"use client";

import { useEffect } from "react";
import { useCart } from "../lib/cart";

export function CartDrawer() {
  const items = useCart((s) => s.items);
  const isOpen = useCart((s) => s.isOpen);
  const close = useCart((s) => s.close);
  const remove = useCart((s) => s.remove);
  const setQuantity = useCart((s) => s.setQuantity);
  const total = useCart((s) => s.total());

  // ESC ferme
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, close]);

  return (
    <>
      <div
        className={`cart-overlay${isOpen ? " open" : ""}`}
        onClick={close}
        aria-hidden={!isOpen}
      />
      <aside
        className={`cart-drawer${isOpen ? " open" : ""}`}
        aria-hidden={!isOpen}
        aria-label="Panier"
      >
        <div className="cart-head">
          <span className="cart-eyebrow">Panier · {items.length} article{items.length !== 1 ? "s" : ""}</span>
          <button className="cart-close" onClick={close} aria-label="Fermer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="6" y1="18" x2="18" y2="6" />
            </svg>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="cart-empty">
            <p className="cart-empty-h">Votre panier est vide.</p>
            <a href="/produit" onClick={close} className="cart-empty-cta">
              Découvrir TrailFlow →
            </a>
          </div>
        ) : (
          <>
            <div className="cart-list">
              {items.map((item) => (
                <div key={`${item.slug}-${item.size}-${item.color}`} className="cart-item">
                  <div className="cart-img">
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className="cart-info">
                    <div className="cart-name">{item.name}</div>
                    {(item.size || item.color) && (
                      <div className="cart-meta">
                        {[item.size && `Taille ${item.size}`, item.color]
                          .filter(Boolean)
                          .join(" · ")}
                      </div>
                    )}
                    <div className="cart-qty">
                      <button onClick={() => setQuantity(item.slug, item.size, item.color, item.quantity - 1)} aria-label="Diminuer">−</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => setQuantity(item.slug, item.size, item.color, item.quantity + 1)} aria-label="Augmenter">+</button>
                    </div>
                  </div>
                  <div className="cart-side">
                    <div className="cart-price">
                      {(item.price * item.quantity).toFixed(2).replace(".", ",")}€
                    </div>
                    <button
                      onClick={() => remove(item.slug, item.size, item.color)}
                      className="cart-remove"
                      aria-label="Retirer"
                    >
                      Retirer
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-foot">
              <div className="cart-total">
                <span>Total</span>
                <span className="cart-total-amount">
                  {total.toFixed(2).replace(".", ",")}€
                </span>
              </div>
              <p className="cart-note">
                Livraison Colissimo offerte · Retour 15 jours
              </p>
              <a href="/checkout" className="cart-checkout" onClick={close}>
                Passer au paiement
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </a>
            </div>
          </>
        )}
      </aside>
    </>
  );
}

export function CartIcon() {
  const open = useCart((s) => s.open);
  const count = useCart((s) => s.count());
  return (
    <button className="cart-icon" onClick={open} aria-label="Ouvrir le panier">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
      {count > 0 && <span className="cart-badge">{count}</span>}
    </button>
  );
}
