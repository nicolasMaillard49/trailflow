"use client";

import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { getAdminToken } from "../AdminShell";

type Order = {
  id: string;
  orderRef: string;
  orderNumber: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  total: number;
  status: string;
  trackingNumber: string | null;
  createdAt: string;
  items: { product?: { name: string }; quantity: number; price: number; variant: string | null }[];
  shippingAddress: { line1: string; line2?: string; city: string; postalCode: string; country: string };
};

const STATUSES = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as const;
const STATUS_LABEL: Record<string, string> = {
  PENDING: "En attente",
  PAID: "Payée",
  PROCESSING: "Préparation",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("ALL");

  const refresh = () => {
    const token = getAdminToken();
    if (!token) return;
    api<{ orders: Order[]; total: number; page: number; totalPages: number }>(
      "/admin/orders",
      { token }
    )
      .then((r) => setOrders(r.orders || []))
      .catch((e) => setError(e.message));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { refresh(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const token = getAdminToken();
    if (!token) return;
    try {
      await api(`/admin/orders/${id}/status`, {
        method: "PUT",
        token,
        body: JSON.stringify({ status }),
      });
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    }
  };

  const filtered = filter === "ALL" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="admin-content">
      <header className="admin-h">
        <h1>Commandes</h1>
        <p>{orders.length} commande{orders.length !== 1 ? "s" : ""} au total</p>
      </header>

      <div className="admin-filter">
        <button onClick={() => setFilter("ALL")} className={filter === "ALL" ? "active" : ""}>Toutes</button>
        {STATUSES.map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={filter === s ? "active" : ""}>
            {STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      {error && <p className="checkout-error">{error}</p>}

      {filtered.length === 0 ? (
        <p className="admin-empty">Aucune commande.</p>
      ) : (
        <div className="admin-orders">
          {filtered.map((o) => (
            <article key={o.id} className="admin-order-card">
              <header>
                <div>
                  <strong>{o.orderRef}</strong>
                  <span className="admin-order-date">{new Date(o.createdAt).toLocaleString("fr-FR")}</span>
                </div>
                <select
                  value={o.status}
                  onChange={(e) => updateStatus(o.id, e.target.value)}
                  className={`status-select status-${o.status.toLowerCase()}`}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                  ))}
                </select>
              </header>

              <div className="admin-order-body">
                <div>
                  <h3>{o.customerName}</h3>
                  <p>{o.customerEmail}</p>
                  {o.customerPhone && <p>{o.customerPhone}</p>}
                  <p className="admin-order-addr">
                    {o.shippingAddress?.line1}
                    {o.shippingAddress?.line2 ? `, ${o.shippingAddress.line2}` : ""}<br />
                    {o.shippingAddress?.postalCode} {o.shippingAddress?.city} · {o.shippingAddress?.country}
                  </p>
                </div>
                <div>
                  <ul className="admin-order-items">
                    {o.items.map((it, i) => (
                      <li key={i}>
                        {it.product?.name || "Article"} {it.variant && `(${it.variant})`} ×{it.quantity}
                        <strong>{(it.price * it.quantity).toFixed(2).replace(".", ",")}€</strong>
                      </li>
                    ))}
                  </ul>
                  <div className="admin-order-total">
                    Total : <strong>{o.total.toFixed(2).replace(".", ",")}€</strong>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
