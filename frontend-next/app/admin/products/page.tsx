"use client";

import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { getAdminToken } from "../AdminShell";

// Réponse réelle du back (admin.service.ts getProducts) :
// select { id, name, slug, costPrice, supplierUrl, active }
type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  costPrice: number;
  supplierUrl: string | null;
  active: boolean;
};

// Pour le détail prix (prix de vente, comparePrice, images), on lit /products/:slug (public)
type PublicProduct = {
  id: string;
  slug: string;
  price: number;
  comparePrice: number | null;
  images: string[];
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [details, setDetails] = useState<Record<string, PublicProduct>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) return;
    api<AdminProduct[]>("/admin/products", { token })
      .then(async (list) => {
        setProducts(list);
        // Fetch les détails publics en parallèle pour avoir prix + images
        const detailEntries = await Promise.all(
          list.map(async (p) => {
            try {
              const d = await api<PublicProduct>(`/products/${p.slug}`);
              return [p.id, d] as const;
            } catch {
              return null;
            }
          })
        );
        const detailMap: Record<string, PublicProduct> = {};
        for (const e of detailEntries) if (e) detailMap[e[0]] = e[1];
        setDetails(detailMap);
      })
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div className="admin-content">
      <header className="admin-h">
        <h1>Produits</h1>
        <p>{products.length} produit{products.length !== 1 ? "s" : ""} en base</p>
      </header>

      {error && <p className="checkout-error">{error}</p>}

      <div className="admin-products">
        {products.map((p) => {
          const d = details[p.id];
          const price = d?.price ?? 0;
          const margin = price - p.costPrice;
          const marginPct = price > 0 ? Math.round((margin / price) * 100) : 0;
          const img = d?.images?.[0];
          return (
            <article key={p.id} className="admin-product-card">
              <div className="admin-product-img">
                {img ? <img src={img} alt={p.name} /> : <span>—</span>}
              </div>
              <div className="admin-product-body">
                <header>
                  <h3>{p.name}</h3>
                  <span className={`admin-pill ${p.active ? "ok" : "off"}`}>
                    {p.active ? "Actif" : "Inactif"}
                  </span>
                </header>
                <p className="admin-product-slug">{p.slug}</p>
                <div className="admin-product-prices">
                  <div>
                    <span>Prix de vente</span>
                    <strong>{price.toFixed(2).replace(".", ",")}€</strong>
                  </div>
                  {d?.comparePrice && (
                    <div>
                      <span>Prix barré</span>
                      <strong>{d.comparePrice.toFixed(2).replace(".", ",")}€</strong>
                    </div>
                  )}
                  <div>
                    <span>Coût d&apos;achat</span>
                    <strong>{p.costPrice.toFixed(2).replace(".", ",")}€</strong>
                  </div>
                  <div>
                    <span>Marge</span>
                    <strong>{margin.toFixed(2).replace(".", ",")}€ ({marginPct}%)</strong>
                  </div>
                </div>
                {p.supplierUrl && (
                  <a
                    href={p.supplierUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="admin-link"
                    style={{ marginTop: 14, display: "inline-block" }}
                  >
                    ↗ Fiche fournisseur
                  </a>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
