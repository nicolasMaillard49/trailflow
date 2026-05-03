import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gilet TrailFlow — Hydration Vest 34,90 €",
  description:
    "Gilet d'hydratation TrailFlow : mesh réfléchissant 360°, 6 poches, boucles click anti-ballottement. Trail · Running · Marathon · Cyclisme. Livraison offerte, retour 15j.",
  alternates: { canonical: "/produit" },
};

export default function ProduitLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
