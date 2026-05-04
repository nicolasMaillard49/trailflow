"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "../lib/api";
import { parseSessionStatus, type SessionStatus } from "../lib/schemas";
import { useCart } from "../lib/cart";
import { trackEvent } from "../components/Trackers";
import { SiteFooter } from "../components/SiteFooter";

function ConfirmationInner() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  const clear = useCart((s) => s.clear);
  const [data, setData] = useState<SessionStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;
    api(`/payments/session-status?session_id=${encodeURIComponent(sessionId)}`, {
      parse: parseSessionStatus,
    })
      .then((r) => {
        if (cancelled) return;
        setData(r);
        if (r.order) {
          // Payload Meta complet : content_ids + contents alimentent les
          // Dynamic Product Ads (retargeting post-achat) et améliorent
          // l'optimisation ROAS / les Lookalike Audiences.
          const items = r.order.items;
          trackEvent("Purchase", {
            transaction_id: r.order.orderNumber,
            value: r.order.total,
            currency: "EUR",
            content_type: "product",
            content_ids: items.map((i) => i.productId).join(","),
            num_items: items.reduce((s, i) => s + i.quantity, 0),
            contents: JSON.stringify(
              items.map((i) => ({ id: i.productId, quantity: i.quantity, item_price: i.price })),
            ),
          });
          clear();
        }
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Erreur inconnue");
      });
    return () => {
      cancelled = true;
    };
  }, [sessionId, clear]);

  return (
    <main className="confirmation-page">
      <nav id="nav">
        <a href="/" className="logo">
          Trail<span>Flow</span>
        </a>
      </nav>

      <div className="confirmation-wrap">
        {!sessionId ? (
          <p className="checkout-error">
            Session de paiement introuvable. Si tu viens de payer, vérifie ton
            email — la commande arrive.
          </p>
        ) : error ? (
          <>
            <h1 className="legal-h1">
              <em>Une erreur est survenue</em>
            </h1>
            <p className="checkout-error">{error}</p>
            <a href="/produit" className="btn-primary">Retour au produit</a>
          </>
        ) : !data ? (
          <p className="confirmation-loading">Vérification du paiement…</p>
        ) : (
          <>
            <div className="confirmation-badge">✓ Paiement confirmé</div>
            <h1 className="legal-h1">
              Merci{data.order?.customerName ? `, ${data.order.customerName.split(" ")[0]}` : ""}
              <br />
              <em>la commande est en route.</em>
            </h1>
            {data.order && (
              <div className="confirmation-card">
                <div className="confirmation-row">
                  <span>Commande</span>
                  <strong>{data.order.orderRef}</strong>
                </div>
                <div className="confirmation-row">
                  <span>Email</span>
                  <strong>{data.order.customerEmail}</strong>
                </div>
                <div className="confirmation-row">
                  <span>Articles</span>
                  <strong>
                    {data.order.items
                      .map((i) => `${i.name} ×${i.quantity}`)
                      .join(" · ")}
                  </strong>
                </div>
                <div className="confirmation-row total">
                  <span>Total payé</span>
                  <strong>{data.order.total.toFixed(2).replace(".", ",")}€</strong>
                </div>
              </div>
            )}
            <p className="confirmation-text">
              Un email de confirmation arrive d'ici quelques minutes. Expédition
              sous 24h, livraison Colissimo 5–7 jours ouvrés. Tu recevras un
              numéro de suivi dès l'envoi.
            </p>
            <div className="confirmation-actions">
              <a
                href={
                  data.order?.trackingMagicLink ||
                  `/suivi?orderRef=${encodeURIComponent(data.order?.orderRef || "")}&email=${encodeURIComponent(data.order?.customerEmail || "")}`
                }
                className="btn-primary"
              >
                Suivre ma commande
              </a>
              <a
                href="/"
                className="btn-primary"
                style={{ background: "transparent", color: "var(--cream)", border: "0.5px solid rgba(240,237,232,0.2)" }}
              >
                Retour à l&apos;accueil
              </a>
            </div>
          </>
        )}
      </div>
      <SiteFooter />
    </main>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="confirmation-loading">Chargement…</div>}>
      <ConfirmationInner />
    </Suspense>
  );
}
