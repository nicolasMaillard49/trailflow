import type { Metadata } from "next";
import { Cormorant_Garamond, Geist } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400"],
  style: ["normal", "italic"],
});

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500"],
});

export const metadata: Metadata = {
  title: "TrailFlow — Gilet hydratation trail & running",
  description:
    "Cours plus loin. Bois malin. Reste léger. Gilet hydratation trail & running — mesh réfléchissant 360°, poches flasques, sécurité nocturne. 34,90 €.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${cormorant.variable} ${geist.variable} h-full`}
    >
      <body className="min-h-full bg-ink text-cream">{children}</body>
    </html>
  );
}
