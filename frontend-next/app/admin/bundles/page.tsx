"use client";

import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { getAdminToken } from "../AdminShell";

type Bundle = {
  id: string;
  slug: string;
  label: string;
  description: string;
  price: number;
  comparePrice: number | null;
  badge: string | null;
  position: number;
  active: boolean;
  items: { productId: string; quantity: number; product?: { name: string } }[];
};

export default function AdminBundlesPage() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) return;
    api<Bundle[]>("/admin/bundles", { token })
      .then(setBundles)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div className="admin-content">
      <header className="admin-h">
        <h1>Bundles</h1>
        <p>{bundles.length} bundle{bundles.length !== 1 ? "s" : ""} configurés (upsells)</p>
      </header>

      {error && <p className="checkout-error">{error}</p>}

      <div className="admin-bundles">
        {bundles.map((b) => (
          <article key={b.id} className="admin-bundle-card">
            <header>
              <div>
                <strong>{b.label}</strong>
                <span className="admin-bundle-slug">{b.slug}</span>
              </div>
              {b.badge && <span className="admin-pill ok">{b.badge}</span>}
            </header>
            <p className="admin-bundle-desc">{b.description}</p>
            <ul className="admin-bundle-items">
              {b.items.map((it, i) => (
                <li key={i}>
                  {it.product?.name || it.productId} ×{it.quantity}
                </li>
              ))}
            </ul>
            <div className="admin-bundle-prices">
              <span>{b.price.toFixed(2).replace(".", ",")}€</span>
              {b.comparePrice && (
                <s>{b.comparePrice.toFixed(2).replace(".", ",")}€</s>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
