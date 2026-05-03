import type { Metadata } from "next";
import "./globals.css";
import { CartDrawer } from "./components/CartDrawer";
import { CookieBanner } from "./components/CookieBanner";
import { Trackers } from "./components/Trackers";
import { ToastHost } from "./components/Toast";

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
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Geist:wght@200;300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        {children}
        <CartDrawer />
        <ToastHost />
        <CookieBanner />
        <Trackers />
      </body>
    </html>
  );
}
