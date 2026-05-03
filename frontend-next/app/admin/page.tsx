"use client";

import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { getAdminToken } from "./AdminShell";

type RecentOrder = {
  id: string;
  orderRef: string;
  orderNumber: number;
  customerName: string;
  customerEmail: string;
  total: number;
  status: string;
  createdAt: string;
};

type Dashboard = {
  totalOrders: number;
  paidOrders: number;
  totalRevenue: number;
  recentOrders: RecentOrder[];
  monthly: { revenue: number; orderCount: number; unitsSold: number };
  productCostPrice: number;
  productPrice: number;
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: "En attente",
  PAID: "Payée",
  PROCESSING: "Préparation",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
};

export default function AdminDashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) return;
    api<Dashboard>("/admin/dashboard", { token })
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="admin-content"><p className="checkout-error">{error}</p></div>;
  if (!data) return <div className="admin-content"><p>Chargement…</p></div>;

  const margin = data.productPrice - data.productCostPrice;
  const marginPct = data.productPrice > 0 ? Math.round((margin / data.productPrice) * 100) : 0;
  const monthlyMargin = data.monthly.unitsSold * margin;

  return (
    <div className="admin-content">
      <header className="admin-h">
        <h1>Vue d&apos;ensemble</h1>
        <p>Activité du store TrailFlow</p>
      </header>

      <div className="admin-stats">
        <div className="admin-stat">
          <span className="admin-stat-label">Commandes (total)</span>
          <span className="admin-stat-num">{data.totalOrders}</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat-label">CA total</span>
          <span className="admin-stat-num">{data.totalRevenue.toFixed(2).replace(".", ",")}€</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat-label">Payées</span>
          <span className="admin-stat-num">{data.paidOrders}</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat-label">CA mois en cours</span>
          <span className="admin-stat-num">{data.monthly.revenue.toFixed(2).replace(".", ",")}€</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat-label">Unités vendues (mois)</span>
          <span className="admin-stat-num">{data.monthly.unitsSold}</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat-label">Marge nette mois (avant ads)</span>
          <span className="admin-stat-num">{monthlyMargin.toFixed(2).replace(".", ",")}€</span>
        </div>
      </div>

      <section className="admin-section">
        <header className="admin-section-h">
          <h2>Marge unitaire</h2>
        </header>
        <div className="admin-margin-grid">
          <div><span>Prix de vente</span><strong>{data.productPrice.toFixed(2).replace(".", ",")}€</strong></div>
          <div><span>Coût d&apos;achat</span><strong>{data.productCostPrice.toFixed(2).replace(".", ",")}€</strong></div>
          <div><span>Marge brute</span><strong>{margin.toFixed(2).replace(".", ",")}€</strong></div>
          <div><span>Taux de marge</span><strong>{marginPct}%</strong></div>
        </div>
      </section>

      <section className="admin-section">
        <header className="admin-section-h">
          <h2>Commandes récentes</h2>
          <a href="/admin/orders" className="admin-link">Voir tout →</a>
        </header>

        {data.recentOrders.length === 0 ? (
          <p className="admin-empty">Aucune commande encore.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>N°</th>
                <th>Client</th>
                <th>Email</th>
                <th>Total</th>
                <th>Statut</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.map((o) => (
                <tr key={o.id}>
                  <td>{o.orderRef}</td>
                  <td>{o.customerName}</td>
                  <td>{o.customerEmail}</td>
                  <td>{o.total.toFixed(2).replace(".", ",")}€</td>
                  <td><span className={`status status-${o.status.toLowerCase()}`}>{STATUS_LABEL[o.status] || o.status}</span></td>
                  <td>{new Date(o.createdAt).toLocaleDateString("fr-FR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
