import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gilet TrailFlow — Hydration Vest 34,90 €",
  description:
    "Gilet d'hydratation TrailFlow : mesh réfléchissant 360°, 6 poches, boucles click anti-ballottement. Trail · Running · Marathon · Cyclisme. Livraison offerte, retour 15j.",
  alternates: { canonical: "/produit" },
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://trailflow.boutique";

/**
 * JSON-LD Product : indispensable pour Google Shopping / les rich results sur
 * les SERP. Sans ça, on perd le snippet (note, prix, dispo) qui multiplie le
 * CTR x2-3 sur un mono-produit dropshipping.
 */
const productJsonLd = {
  "@context": "https://schema.org/",
  "@type": "Product",
  name: "Gilet TrailFlow — Hydration Vest",
  image: [
    `${SITE_URL}/images/product-face.png`,
    `${SITE_URL}/images/product-3quart.png`,
    `${SITE_URL}/images/product-dos.png`,
  ],
  description:
    "Gilet d'hydratation pour trail et running : mesh réfléchissant 360°, 6 poches, boucles click anti-ballottement. Unisexe S à XL.",
  sku: "TF-HV-001",
  brand: { "@type": "Brand", name: "TrailFlow" },
  offers: {
    "@type": "Offer",
    url: `${SITE_URL}/produit`,
    priceCurrency: "EUR",
    price: "34.90",
    priceValidUntil: "2026-12-31",
    availability: "https://schema.org/InStock",
    itemCondition: "https://schema.org/NewCondition",
    shippingDetails: {
      "@type": "OfferShippingDetails",
      shippingRate: {
        "@type": "MonetaryAmount",
        value: "0",
        currency: "EUR",
      },
      shippingDestination: {
        "@type": "DefinedRegion",
        addressCountry: ["FR", "BE", "CH", "LU"],
      },
    },
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.7",
    reviewCount: "477",
  },
};

export default function ProduitLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        // dangerouslySetInnerHTML est ici la pratique recommandée par Next pour
        // injecter du JSON-LD dans <head>/body.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      {children}
    </>
  );
}
