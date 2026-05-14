import type { Metadata } from "next";
import { Cormorant_Garamond, Geist } from "next/font/google";
import "./globals.css";
import { CartDrawer } from "./components/CartDrawer";
import { CookieBanner } from "./components/CookieBanner";
import { Trackers } from "./components/Trackers";
import { ToastHost } from "./components/Toast";
import { WelcomePopup } from "./components/WelcomePopup";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const geist = Geist({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500"],
  variable: "--font-geist",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://trailflow.boutique";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  title: {
    default: "TrailFlow — Gilet hydratation trail & running",
    template: "%s · TrailFlow",
  },
  description:
    "Cours plus loin. Bois malin. Reste léger. Gilet d'hydratation trail & running — mesh réfléchissant 360°, 6 poches, anti-ballottement. 34,90 €.",
  applicationName: "TrailFlow",
  keywords: [
    "gilet hydratation",
    "trail running",
    "marathon",
    "course à pied",
    "hydration vest",
    "TrailFlow",
  ],
  authors: [{ name: "NMF Agence", url: "https://www.nmf-agence.com/" }],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: SITE_URL,
    siteName: "TrailFlow",
    title: "TrailFlow — Gilet hydratation trail & running",
    description:
      "Cours plus loin. Bois malin. Reste léger. 34,90 € · Livraison offerte · Retour 15 jours.",
    images: [
      {
        url: "/images/wom-studio.png",
        width: 1200,
        height: 630,
        alt: "TrailFlow — Gilet hydratation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TrailFlow — Gilet hydratation trail & running",
    description: "Cours plus loin. Bois malin. Reste léger. 34,90 €.",
    images: ["/images/wom-studio.png"],
  },
  robots: { index: true, follow: true },
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION || undefined,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${cormorant.variable} ${geist.variable}`}
    >
      <body suppressHydrationWarning>
        {children}
        <CartDrawer />
        <ToastHost />
        <WelcomePopup />
        <CookieBanner />
        <Trackers />
      </body>
    </html>
  );
}
