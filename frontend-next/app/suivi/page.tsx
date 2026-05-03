"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "../lib/api";
import { SiteFooter } from "../components/SiteFooter";

type TrackedOrder = {
  id: string;
  orderRef: string;
  orderNumber: number;
  status: string;
  customerName: string;
  customerEmail: string;
  createdAt: string;
  trackingNumber: string | null;
  trackingUrl: string | null;
  total: number;
  items: { name: string; quantity: number; price: number }[];
};

const STATUS_FR: Record<string, string> = {
  PENDING: "En attente de paiement",
  PAID: "Paiement confirmé",
  PROCESSING: "En préparation",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
};

const STATUS_STEPS = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"];

function StatusTimeline({ status }: { status: string }) {
  const currentIdx = STATUS_STEPS.indexOf(status);
  return (
    <ol className="suivi-timeline">
      {STATUS_STEPS.map((s, i) => {
        const done = i <= currentIdx;
        const current = i === currentIdx;
        return (
          <li
            key={s}
            className={`suivi-step${done ? " done" : ""}${current ? " current" : ""}`}
          >
            <span className="suivi-step-dot" />
            <span className="suivi-step-label">{STATUS_FR[s]}</span>
          </li>
        );
      })}
    </ol>
  );
}

function SuiviInner() {
  const params = useSearchParams();
  const token = params.get("token");
  const initialOrderRef = params.get("orderRef") || "";
  const initialEmail = params.get("email") || "";
  const [data, setData] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [orderRef, setOrderRef] = useState(initialOrderRef);
  const [email, setEmail] = useState(initialEmail);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    api<TrackedOrder>(`/tracking/magic?token=${encodeURIComponent(token)}`)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  // Auto-soumission si les 2 champs sont préremplis depuis l'URL
  useEffect(() => {
    if (!token && initialOrderRef && initialEmail) {
      const auto = async () => {
        setLoading(true);
        try {
          const res = await api<TrackedOrder>("/tracking/lookup", {
            method: "POST",
            body: JSON.stringify({
              orderRef: initialOrderRef,
              email: initialEmail,
            }),
          });
          setData(res);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Erreur");
        } finally {
          setLoading(false);
        }
      };
      auto();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api<TrackedOrder>("/tracking/lookup", {
        method: "POST",
        body: JSON.stringify({ orderRef, email }),
      });
      setData(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="legal-page">
      <div className="legal-wrap" style={{ maxWidth: 720 }}>
        <a href="/" className="legal-back">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Retour à l&apos;accueil
        </a>

        <h1 className="legal-h1">
          Suivi <em>de commande</em>
        </h1>

        {data ? (
          <>
            <div className="suivi-card">
              <div className="suivi-head">
                <div>
                  <span className="suivi-eyebrow">Commande</span>
                  <strong className="suivi-ref">{data.orderRef}</strong>
                </div>
                <span className={`status status-${data.status.toLowerCase()}`}>
                  {STATUS_FR[data.status] || data.status}
                </span>
              </div>

              <StatusTimeline status={data.status} />

              <dl className="suivi-meta">
                <div>
                  <dt>Client</dt>
                  <dd>{data.customerName}</dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>{data.customerEmail}</dd>
                </div>
                <div>
                  <dt>Commandée le</dt>
                  <dd>{new Date(data.createdAt).toLocaleDateString("fr-FR", {
                    day: "numeric", month: "long", year: "numeric",
                  })}</dd>
                </div>
                <div>
                  <dt>Total</dt>
                  <dd>{data.total.toFixed(2).replace(".", ",")}€</dd>
                </div>
                {data.trackingNumber && (
                  <div>
                    <dt>N° de suivi</dt>
                    <dd>
                      {data.trackingUrl ? (
                        <a href={data.trackingUrl} target="_blank" rel="noopener noreferrer">
                          {data.trackingNumber} ↗
                        </a>
                      ) : (
                        data.trackingNumber
                      )}
                    </dd>
                  </div>
                )}
              </dl>

              <div className="suivi-items">
                <span className="suivi-eyebrow">Articles</span>
                <ul>
                  {data.items.map((it, i) => (
                    <li key={i}>
                      <span>{it.name} ×{it.quantity}</span>
                      <strong>{(it.price * it.quantity).toFixed(2).replace(".", ",")}€</strong>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <p className="suivi-help">
              Une question ?{" "}
              <a href="mailto:contact@trailflow.boutique">contact@trailflow.boutique</a>
            </p>
          </>
        ) : (
          <>
            {token && loading && <p className="confirmation-loading">Chargement de votre commande…</p>}
            {token && error && (
              <p className="checkout-error">
                Lien invalide ou expiré. Essayez de retrouver votre commande ci-dessous.
              </p>
            )}

            {!token && (
              <p className="legal-section" style={{ marginTop: -24 }}>
                Vous avez reçu un email de confirmation avec un lien direct vers
                votre commande. Sinon, retrouvez-la avec votre référence de
                commande (format <strong>TF-XXXX-XXXX</strong>) et votre email.
              </p>
            )}

            <form onSubmit={onSubmit} className="suivi-form">
              <label className="form-field">
                <span>Référence de commande</span>
                <input
                  type="text"
                  required
                  placeholder="TF-XXXX-XXXX"
                  value={orderRef}
                  onChange={(e) => setOrderRef(e.target.value)}
                />
              </label>
              <label className="form-field">
                <span>Email utilisé à la commande</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              {error && <p className="checkout-error">{error}</p>}
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Recherche…" : "Voir ma commande"}
              </button>
            </form>
          </>
        )}
      </div>
      <SiteFooter />
    </main>
  );
}

export default function SuiviPage() {
  return (
    <Suspense fallback={<div className="confirmation-loading">Chargement…</div>}>
      <SuiviInner />
    </Suspense>
  );
}
