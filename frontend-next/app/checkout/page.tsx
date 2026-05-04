"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { useCart } from "../lib/cart";
import { api } from "../lib/api";
import { parseCheckoutCreate } from "../lib/schemas";
import { CartIcon } from "../components/CartDrawer";
import { SiteFooter } from "../components/SiteFooter";

/**
 * Stripe EmbeddedCheckoutProvider rappelle `fetchClientSecret` à chaque échec
 * et peut spammer le backend en boucle si tout est down. On capote à 3
 * tentatives par mount pour ne pas geler l'onglet ni faire DDoS notre API.
 */
const MAX_FETCH_CLIENT_SECRET_ATTEMPTS = 3;

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PK || "pk_test_placeholder"
);

type FormState = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  postalCode: string;
  country: string;
};

export default function CheckoutPage() {
  const items = useCart((s) => s.items);
  const total = useCart((s) => s.total());
  const [step, setStep] = useState<"form" | "payment">("form");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Zustand persist se réhydrate côté client après le 1er render. Avant ça,
  // `items` est vide [] → on affichait "Panier vide" pendant ~100-500 ms même
  // si l'utilisateur avait des articles. On retarde le rendu du contenu jusqu'à
  // ce que la persistance ait fini de charger pour éviter ce flash.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);
  const [form, setForm] = useState<FormState>({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    postalCode: "",
    country: "FR",
  });

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

  const set =
    <K extends keyof FormState>(k: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (items.length === 0) {
      setError("Votre panier est vide.");
      return;
    }
    setStep("payment");
  };

  // Compteur d'appels à fetchClientSecret pour ce mount — réinitialisé quand
  // l'utilisateur clique "Modifier mes coordonnées" (cf. retour à l'étape "form").
  const attemptsRef = useRef(0);

  useEffect(() => {
    if (step === "form") attemptsRef.current = 0;
  }, [step]);

  // Charge le clientSecret Stripe
  const fetchClientSecret = useCallback(async (): Promise<string> => {
    setError(null);
    if (items.length === 0) throw new Error("Panier vide");

    attemptsRef.current += 1;
    if (attemptsRef.current > MAX_FETCH_CLIENT_SECRET_ATTEMPTS) {
      const msg =
        "Le service de paiement est temporairement indisponible. Réessaye dans quelques instants.";
      setError(msg);
      // On throw pour que Stripe arrête les retries — l'utilisateur voit le
      // message d'erreur et peut revenir à l'étape précédente.
      throw new Error(msg);
    }

    try {
      const res = await api("/payments/create-checkout", {
        method: "POST",
        parse: parseCheckoutCreate,
        body: JSON.stringify({
          // On envoie l'intégralité du panier — chaque item devient un line_item
          // Stripe et un OrderItem distinct (taille/coloris persistés pour le SAV).
          items: items.map((it) => ({
            productId: it.productId,
            quantity: it.quantity,
            size: it.size,
            color: it.color,
          })),
          customerEmail: form.customerEmail,
          customerName: form.customerName,
          customerPhone: form.customerPhone,
          shippingAddress: {
            line1: form.addressLine1,
            line2: form.addressLine2,
            city: form.city,
            postalCode: form.postalCode,
            country: form.country,
          },
          sport: "trail",
        }),
      });
      return res.clientSecret;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erreur de paiement";
      setError(msg);
      throw e;
    }
  }, [items, form]);

  return (
    <main className="checkout-page">
      <nav id="nav">
        <a href="/" className="logo">
          Trail<span>Flow</span>
        </a>
        <div className="nav-r">
          <a href="/suivi" className="nav-link">Suivi commande</a>
          <a href="/produit" className="nav-link">Retour au produit</a>
          <CartIcon />
        </div>
      </nav>

      <div className="checkout-wrap">
        <a href="/produit" className="legal-back">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Retour
        </a>

        <h1 className="legal-h1">Finaliser la commande</h1>

        {!hydrated ? (
          <div className="checkout-empty">
            <p className="confirmation-loading">Chargement du panier…</p>
          </div>
        ) : items.length === 0 ? (
          <div className="checkout-empty">
            <p>Votre panier est vide.</p>
            <a href="/produit" className="btn-primary">Découvrir le produit</a>
          </div>
        ) : (
          <div className="checkout-grid">
            {/* COLONNE GAUCHE — formulaire ou Stripe */}
            <div>
              {step === "form" ? (
                <form className="checkout-form" onSubmit={onSubmitForm}>
                  <h2 className="checkout-h2">
                    <span className="num">01</span>Vos coordonnées
                  </h2>
                  <div className="form-row">
                    <label className="form-field">
                      <span>Email</span>
                      <input
                        type="email"
                        required
                        autoComplete="email"
                        value={form.customerEmail}
                        onChange={set("customerEmail")}
                        placeholder="vous@exemple.com"
                      />
                    </label>
                    <label className="form-field">
                      <span>Nom complet</span>
                      <input
                        type="text"
                        required
                        autoComplete="name"
                        value={form.customerName}
                        onChange={set("customerName")}
                        placeholder="Prénom Nom"
                      />
                    </label>
                    <label className="form-field">
                      <span>Téléphone</span>
                      <input
                        type="tel"
                        autoComplete="tel"
                        value={form.customerPhone}
                        onChange={set("customerPhone")}
                        placeholder="+33 6 …"
                      />
                    </label>
                  </div>

                  <h2 className="checkout-h2" style={{ marginTop: 40 }}>
                    <span className="num">02</span>Adresse de livraison
                  </h2>
                  <div className="form-row">
                    <label className="form-field full">
                      <span>Adresse</span>
                      <input
                        type="text"
                        required
                        autoComplete="address-line1"
                        value={form.addressLine1}
                        onChange={set("addressLine1")}
                        placeholder="Numéro et rue"
                      />
                    </label>
                    <label className="form-field full">
                      <span>Complément (optionnel)</span>
                      <input
                        type="text"
                        autoComplete="address-line2"
                        value={form.addressLine2}
                        onChange={set("addressLine2")}
                        placeholder="Bâtiment, étage…"
                      />
                    </label>
                    <label className="form-field">
                      <span>Code postal</span>
                      <input
                        type="text"
                        required
                        autoComplete="postal-code"
                        value={form.postalCode}
                        onChange={set("postalCode")}
                      />
                    </label>
                    <label className="form-field">
                      <span>Ville</span>
                      <input
                        type="text"
                        required
                        autoComplete="address-level2"
                        value={form.city}
                        onChange={set("city")}
                      />
                    </label>
                    <label className="form-field">
                      <span>Pays</span>
                      <select
                        required
                        autoComplete="country"
                        value={form.country}
                        onChange={set("country")}
                      >
                        <option value="FR">France</option>
                        <option value="BE">Belgique</option>
                        <option value="CH">Suisse</option>
                        <option value="LU">Luxembourg</option>
                      </select>
                    </label>
                  </div>

                  {error && <p className="checkout-error">{error}</p>}

                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={submitting}
                    style={{ marginTop: 32 }}
                  >
                    Continuer vers le paiement
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </button>
                </form>
              ) : (
                <div className="checkout-stripe">
                  <h2 className="checkout-h2">
                    <span className="num">03</span>Paiement sécurisé
                  </h2>
                  <button
                    type="button"
                    className="checkout-back-step"
                    onClick={() => setStep("form")}
                  >
                    ← Modifier mes coordonnées
                  </button>
                  {error && <p className="checkout-error">{error}</p>}
                  <div className="stripe-mount">
                    <EmbeddedCheckoutProvider
                      stripe={stripePromise}
                      options={{ fetchClientSecret }}
                    >
                      <EmbeddedCheckout />
                    </EmbeddedCheckoutProvider>
                  </div>
                </div>
              )}
            </div>

            {/* COLONNE DROITE — récap panier */}
            <aside className="checkout-summary">
              <h3 className="checkout-summary-h">Votre commande</h3>
              <div className="checkout-items">
                {items.map((it) => (
                  <div key={`${it.slug}-${it.size}-${it.color}`} className="checkout-item">
                    <div className="checkout-item-img">
                      <img src={it.image} alt={it.name} />
                    </div>
                    <div className="checkout-item-info">
                      <div className="checkout-item-name">{it.name}</div>
                      <div className="checkout-item-meta">
                        {[it.size && `Taille ${it.size}`, it.color, `×${it.quantity}`]
                          .filter(Boolean)
                          .join(" · ")}
                      </div>
                    </div>
                    <div className="checkout-item-price">
                      {(it.price * it.quantity).toFixed(2).replace(".", ",")}€
                    </div>
                  </div>
                ))}
              </div>
              <div className="checkout-totals">
                <div className="checkout-line">
                  <span>Sous-total</span>
                  <span>{total.toFixed(2).replace(".", ",")}€</span>
                </div>
                <div className="checkout-line">
                  <span>Livraison</span>
                  <span>Offerte</span>
                </div>
                <div className="checkout-line checkout-total">
                  <span>Total</span>
                  <span>{total.toFixed(2).replace(".", ",")}€</span>
                </div>
              </div>
              <p className="checkout-note">
                Paiement 100% sécurisé via Stripe · Retour gratuit 15 jours
              </p>
            </aside>
          </div>
        )}
      </div>
      <SiteFooter />
    </main>
  );
}
