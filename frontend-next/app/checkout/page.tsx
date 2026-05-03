"use client";

import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import { useCallback } from "react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { useCart } from "@/lib/cart";
import { API_URL } from "@/lib/api";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PK || "pk_test_placeholder"
);

export default function CheckoutPage() {
  const items = useCart((s) => s.items);

  const fetchClientSecret = useCallback(async () => {
    // TODO: brancher vraiment sur DTO multi-items côté NestJS.
    // Pour l'instant on envoie le 1er item (mono-produit) — backend supporte 1 product/quantity.
    const first = items[0];
    if (!first) throw new Error("Panier vide");

    const r = await fetch(`${API_URL}/api/payments/create-checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: first.productId,
        quantity: first.quantity,
        // sport tracking optionnel — peut servir pour ads
        sport: "trail",
        // L'utilisateur saisit ses infos dans Stripe Embedded directement,
        // on envoie des placeholders (le backend valide via class-validator).
        customerEmail: "pending@stripe.io",
        customerName: "Stripe",
        customerPhone: "",
        shippingAddress: {
          line1: "—",
          city: "—",
          postalCode: "—",
          country: "FR",
        },
      }),
    });
    if (!r.ok) throw new Error(await r.text());
    const { clientSecret } = await r.json();
    return clientSecret;
  }, [items]);

  if (items.length === 0) {
    return (
      <>
        <Nav />
        <main className="pt-32 pb-32 px-6 md:px-14 min-h-svh text-center">
          <h1 className="font-display font-light italic text-[40px] text-cream">
            Panier vide.
          </h1>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Nav />
      <main className="pt-28 pb-32 px-6 md:px-14 min-h-svh">
        <div className="max-w-3xl mx-auto">
          <span className="block text-[10px] font-light tracking-[0.28em] uppercase text-muted mb-6">
            Paiement sécurisé
          </span>
          <h1 className="font-display font-light italic text-[clamp(36px,3.6vw,52px)] leading-[1.05] text-cream mb-10">
            Encore une étape.
          </h1>

          <div className="bg-cream rounded-[3px] overflow-hidden">
            <EmbeddedCheckoutProvider
              stripe={stripePromise}
              options={{ fetchClientSecret }}
            >
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
