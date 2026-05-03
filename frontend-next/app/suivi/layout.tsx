import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Suivi de commande",
  description:
    "Suivez votre commande TrailFlow : statut, livraison, numéro de suivi Colissimo.",
  alternates: { canonical: "/suivi" },
};

export default function SuiviLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
