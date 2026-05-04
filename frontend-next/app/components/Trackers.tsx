"use client";

import Script from "next/script";

const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID;
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

/**
 * Charge GA4 + Meta Pixel dès qu'une env var est définie.
 * Le consentement cookies n'a AUCUN effet sur les trackers (choix produit assumé).
 */
export function Trackers() {
  return (
    <>
      {/* Google Analytics 4 */}
      {GA4_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA4_ID}', { anonymize_ip: true });
            `}
          </Script>
        </>
      )}

      {/* Meta Pixel */}
      {META_PIXEL_ID && (
        <>
          <Script id="meta-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${META_PIXEL_ID}');
              fbq('track', 'PageView');
            `}
          </Script>
          <noscript>
            <img
              height="1"
              width="1"
              alt=""
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
            />
          </noscript>
        </>
      )}
    </>
  );
}

/**
 * Helper pour tracker un événement custom (ex: AddToCart, Purchase).
 * Safe-call : ne fait rien si le script n'est pas chargé.
 */
type TrackPayload = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (command: string, action: string, params?: TrackPayload) => void;
    fbq?: (command: string, event: string, params?: TrackPayload, options?: { eventID?: string }) => void;
  }
}

export function trackEvent(name: string, payload?: TrackPayload, options?: { eventID?: string }) {
  if (typeof window === "undefined") return;
  if (typeof window.gtag === "function") window.gtag("event", name, payload);
  if (typeof window.fbq === "function") {
    // Le 4e arg de fbq est utilisé par Meta pour dédoublonner avec un event
    // identique envoyé par la Conversions API server-side. Indispensable
    // pour Purchase quand CAPI est branchée.
    if (options?.eventID) {
      window.fbq("track", name, payload, { eventID: options.eventID });
    } else {
      window.fbq("track", name, payload);
    }
  }
}

/** Lit un cookie côté client (utile pour récupérer _fbp / _fbc avant POST). */
export function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const m = document.cookie.match(new RegExp(`(^|;\\s*)${name}=([^;]+)`));
  return m ? decodeURIComponent(m[2]) : undefined;
}
